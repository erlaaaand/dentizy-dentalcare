'use client';

import React, { useState } from 'react';
import { Appointment, Patient } from '@/types/api';
import { Calendar, Clock, User, FileText } from 'lucide-react';

interface AppointmentFormData {
  patient_id: string;
  tanggal_janji: string;
  jam_janji: string;
  keluhan: string;
  status: 'dijadwalkan' | 'selesai' | 'dibatalkan';
  catatan?: string;
}

interface AppointmentFormProps {
  initialData?: Appointment;
  patients?: Patient[];
  onSubmit: (data: AppointmentFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AppointmentForm({
  initialData,
  patients = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: initialData?.patient_id?.toString() || '',
    tanggal_janji: initialData?.tanggal_janji
      ? new Date(initialData.tanggal_janji).toISOString().split('T')[0]
      : '',
    jam_janji: initialData?.jam_janji || '',
    keluhan: initialData?.keluhan || '',
    status: initialData?.status || 'dijadwalkan',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AppointmentFormData, boolean>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof AppointmentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (field: keyof AppointmentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AppointmentFormData, string>> = {};

    if (!formData.patient_id) newErrors.patient_id = 'Pasien harus dipilih';
    if (!formData.tanggal_janji) newErrors.tanggal_janji = 'Tanggal janji harus diisi';
    if (!formData.jam_janji) newErrors.jam_janji = 'Jam janji harus diisi';
    if (!formData.keluhan || formData.keluhan.trim().length < 10)
      newErrors.keluhan = 'Keluhan minimal 10 karakter';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      patient_id: true,
      tanggal_janji: true,
      jam_janji: true,
      keluhan: true,
      status: true,
    });

    if (!validate()) return;
    await onSubmit(formData);
  };

  const showError = (field: keyof AppointmentFormData) => touched[field] && errors[field];

  const statusOptions = [
    { value: 'dijadwalkan', label: 'Dijadwalkan' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pasien */}
      <div>
        <label htmlFor="patient_id" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <User className="w-5 h-5 text-blue-600" />
          Pasien <span className="text-red-500">*</span>
        </label>
        <select
          id="patient_id"
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          onBlur={() => handleBlur('patient_id')}
          className={`w-full px-4 py-3 border rounded-lg ${showError('patient_id') ? 'border-red-500' : 'border-gray-300'
            }`}
          disabled={isLoading || !!initialData}
        >
          <option value="">Pilih Pasien</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_lengkap} - {p.nomor_rekam_medis}
            </option>
          ))}
        </select>
        {showError('patient_id') && <p className="text-sm text-red-600 mt-1">{errors.patient_id}</p>}
      </div>

      {/* Tanggal & Jam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tanggal_janji" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="tanggal_janji"
            name="tanggal_janji"
            value={formData.tanggal_janji}
            onChange={handleChange}
            onBlur={() => handleBlur('tanggal_janji')}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg ${showError('tanggal_janji') ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
          />
          {showError('tanggal_janji') && <p className="text-sm text-red-600 mt-1">{errors.tanggal_janji}</p>}
        </div>

        <div>
          <label htmlFor="jam_janji" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Jam <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="jam_janji"
            name="jam_janji"
            value={formData.jam_janji}
            onChange={handleChange}
            onBlur={() => handleBlur('jam_janji')}
            className={`w-full px-4 py-3 border rounded-lg ${showError('jam_janji') ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={isLoading}
          />
          {showError('jam_janji') && <p className="text-sm text-red-600 mt-1">{errors.jam_janji}</p>}
        </div>
      </div>

      {/* Keluhan */}
      <div>
        <label htmlFor="keluhan" className="block text-sm font-medium text-gray-700 mb-2">
          Keluhan <span className="text-red-500">*</span>
        </label>
        <textarea
          id="keluhan"
          name="keluhan"
          value={formData.keluhan}
          onChange={handleChange}
          onBlur={() => handleBlur('keluhan')}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg ${showError('keluhan') ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Jelaskan keluhan pasien..."
          disabled={isLoading}
        />
        {showError('keluhan') && <p className="text-sm text-red-600 mt-1">{errors.keluhan}</p>}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>{initialData ? 'Update Janji Temu' : 'Buat Janji Temu'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
