'use client';

import React, { useState, useEffect } from 'react';
import { Appointment, Patient, User, AppointmentStatus } from '@/types/api';
import { useAuthStore } from '@/lib/store/authStore';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Calendar, Clock, User as UserIcon, FileText, Stethoscope } from 'lucide-react';

interface AppointmentFormData {
  patient_id: string;
  doctor_id?: string;
  tanggal_janji: string;
  jam_janji: string;
  keluhan: string;
  status?: AppointmentStatus;
}

interface AppointmentFormProps {
  initialData?: Appointment;
  patients: Patient[];
  doctors: User[];
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AppointmentForm({
  initialData,
  patients,
  doctors,
  onSubmit,
  onCancel,
  isLoading = false,
}: AppointmentFormProps) {
  const { user, isDokter, isStaf, isKepalaKlinik } = useAuthStore();

  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: initialData?.patient_id?.toString() || '',
    doctor_id: initialData?.doctor_id?.toString() || user?.id.toString() || '',
    tanggal_janji: initialData?.tanggal_janji
      ? new Date(initialData.tanggal_janji).toISOString().split('T')[0]
      : '',
    jam_janji: initialData?.jam_janji || '',
    keluhan: initialData?.keluhan || '',
    status: initialData?.status || AppointmentStatus.DIJADWALKAN,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AppointmentFormData, boolean>>>({});

  // Auto-set doctor for dokter role
  useEffect(() => {
    if (isDokter() && user && !formData.doctor_id) {
      setFormData(prev => ({ ...prev, doctor_id: user.id.toString() }));
    }
  }, [isDokter, user]);

  const handleChange = (field: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof AppointmentFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof AppointmentFormData) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'patient_id':
        if (!formData.patient_id) {
          newErrors.patient_id = 'Pasien harus dipilih';
        } else {
          delete newErrors.patient_id;
        }
        break;

      case 'doctor_id':
        if (!formData.doctor_id && (isStaf() || isKepalaKlinik())) {
          newErrors.doctor_id = 'Dokter harus dipilih';
        } else {
          delete newErrors.doctor_id;
        }
        break;

      case 'tanggal_janji':
        if (!formData.tanggal_janji) {
          newErrors.tanggal_janji = 'Tanggal janji harus diisi';
        } else {
          const selectedDate = new Date(formData.tanggal_janji);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (!initialData && selectedDate < today) {
            newErrors.tanggal_janji = 'Tanggal janji tidak boleh di masa lalu';
          } else {
            delete newErrors.tanggal_janji;
          }
        }
        break;

      case 'jam_janji':
        if (!formData.jam_janji) {
          newErrors.jam_janji = 'Jam janji harus diisi';
        } else {
          delete newErrors.jam_janji;
        }
        break;

      case 'keluhan':
        if (!formData.keluhan || formData.keluhan.trim().length < 10) {
          newErrors.keluhan = 'Keluhan minimal 10 karakter';
        } else if (formData.keluhan.length > 500) {
          newErrors.keluhan = 'Keluhan maksimal 500 karakter';
        } else {
          delete newErrors.keluhan;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = (): boolean => {
    const fields: (keyof AppointmentFormData)[] = [
      'patient_id',
      'tanggal_janji',
      'jam_janji',
      'keluhan',
    ];

    if (isStaf() || isKepalaKlinik()) {
      fields.push('doctor_id');
    }

    const allTouched = fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Partial<Record<keyof AppointmentFormData, boolean>>);

    setTouched(allTouched);

    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = {
      patient_id: parseInt(formData.patient_id),
      doctor_id: parseInt(formData.doctor_id || user?.id.toString() || '0'),
      tanggal_janji: formData.tanggal_janji,
      jam_janji: formData.jam_janji.includes(':00')
        ? formData.jam_janji
        : `${formData.jam_janji}:00`,
      keluhan: formData.keluhan.trim(),
      status: formData.status,
    };

    await onSubmit(submitData);
  };

  const showError = (field: keyof AppointmentFormData) =>
    touched[field] ? errors[field] : undefined;

  const patientOptions = patients.map(p => ({
    value: p.id.toString(),
    label: `${p.nama_lengkap} - ${p.nomor_rekam_medis}`,
  }));

  const doctorOptions = doctors.map(d => ({
    value: d.id.toString(),
    label: d.nama_lengkap,
  }));

  const statusOptions = [
    { value: AppointmentStatus.DIJADWALKAN, label: 'Dijadwalkan' },
    { value: AppointmentStatus.SELESAI, label: 'Selesai' },
    { value: AppointmentStatus.DIBATALKAN, label: 'Dibatalkan' },
  ];

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pasien */}
      <Select
        label="Pasien"
        placeholder="Pilih Pasien"
        options={patientOptions}
        value={formData.patient_id}
        onChange={value => handleChange('patient_id', value)}
        error={showError('patient_id')}
        required
        disabled={isLoading || !!initialData}
        containerClassName="w-full"
      />

      {/* Dokter - Only show for staff and kepala klinik */}
      {(isStaf() || isKepalaKlinik()) && (
        <Select
          label="Dokter"
          placeholder="Pilih Dokter"
          options={doctorOptions}
          value={formData.doctor_id}
          onChange={value => handleChange('doctor_id', value)}
          error={showError('doctor_id')}
          required
          disabled={isLoading}
          containerClassName="w-full"
        />
      )}

      {/* Tanggal & Jam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Tanggal"
          value={formData.tanggal_janji}
          onChange={e => handleChange('tanggal_janji', e.target.value)}
          onBlur={() => handleBlur('tanggal_janji')}
          min={!initialData ? today : undefined}
          error={showError('tanggal_janji')}
          required
          disabled={isLoading}
          leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
        />

        <Input
          type="time"
          label="Jam"
          value={formData.jam_janji}
          onChange={e => handleChange('jam_janji', e.target.value)}
          onBlur={() => handleBlur('jam_janji')}
          error={showError('jam_janji')}
          required
          disabled={isLoading}
          leftIcon={<Clock className="w-5 h-5 text-gray-400" />}
        />
      </div>

      {/* Keluhan */}
      <Textarea
        label="Keluhan"
        value={formData.keluhan}
        onChange={e => handleChange('keluhan', e.target.value)}
        onBlur={() => handleBlur('keluhan')}
        rows={4}
        placeholder="Jelaskan keluhan pasien..."
        error={showError('keluhan')}
        required
        disabled={isLoading}
        maxLength={500}
        showCharCount
      />

      {/* Status - Only show when editing */}
      {initialData && (
        <Select
          label="Status"
          options={statusOptions}
          value={formData.status}
          onChange={value => handleChange('status', value as AppointmentStatus)}
          disabled={isLoading}
          containerClassName="w-full"
        />
      )}

      {/* Info Box for Dokter */}
      {isDokter() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Janji temu akan otomatis terdaftar atas nama Anda
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Dokter: {user?.nama_lengkap}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
          className="flex-1"
        >
          {initialData ? 'Update Janji Temu' : 'Buat Janji Temu'}
        </Button>
      </div>
    </form>
  );
}