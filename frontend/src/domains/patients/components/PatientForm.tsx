'use client';

import React, { useState, useEffect } from 'react';
import { Patient, Gender } from '@/core/types/api';
import { validatePatientForm, sanitizePatientFormData, PatientFormData } from '@/core/validators/patientSchema';
import { GENDER_OPTIONS } from '@/lib/constants';
import { toInputDate } from '@/core/formatters';
import { User, Calendar, Mail, Phone, MapPin, Users } from 'lucide-react';

interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: PatientFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PatientForm({ initialData, onSubmit, onCancel, isLoading = false }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    nama_lengkap: initialData?.nama_lengkap || '',
    nik: initialData?.nik || '',
    email: initialData?.email || '',
    no_hp: initialData?.no_hp || '',
    tanggal_lahir: initialData?.tanggal_lahir ? toInputDate(initialData.tanggal_lahir) : '',
    jenis_kelamin: initialData?.jenis_kelamin || undefined,
    alamat: initialData?.alamat || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PatientFormData, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof PatientFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (field: keyof PatientFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof PatientFormData] = true;
      return acc;
    }, {} as Partial<Record<keyof PatientFormData, boolean>>);
    setTouched(allTouched);

    // Validate form
    const validation = validatePatientForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Sanitize and submit
    const sanitizedData = sanitizePatientFormData(formData);
    await onSubmit(sanitizedData);
  };

  const showError = (field: keyof PatientFormData) => {
    return touched[field] && errors[field];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nama Lengkap */}
      <div>
        <label htmlFor="nama_lengkap" className="block text-sm font-medium text-gray-700 mb-2">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            id="nama_lengkap"
            name="nama_lengkap"
            value={formData.nama_lengkap}
            onChange={handleChange}
            onBlur={() => handleBlur('nama_lengkap')}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('nama_lengkap') ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Masukkan nama lengkap"
            disabled={isLoading}
          />
        </div>
        {showError('nama_lengkap') && (
          <p className="mt-1 text-sm text-red-600">{errors.nama_lengkap}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NIK */}
        <div>
          <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-2">
            NIK
          </label>
          <input
            type="text"
            id="nik"
            name="nik"
            value={formData.nik}
            onChange={handleChange}
            onBlur={() => handleBlur('nik')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('nik') ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="16 digit NIK"
            maxLength={16}
            disabled={isLoading}
          />
          {showError('nik') && (
            <p className="mt-1 text-sm text-red-600">{errors.nik}</p>
          )}
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label htmlFor="tanggal_lahir" className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Lahir
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              id="tanggal_lahir"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              onBlur={() => handleBlur('tanggal_lahir')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('tanggal_lahir') ? 'border-red-500' : 'border-gray-300'
                }`}
              disabled={isLoading}
            />
          </div>
          {showError('tanggal_lahir') && (
            <p className="mt-1 text-sm text-red-600">{errors.tanggal_lahir}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('email') ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="email@example.com"
              disabled={isLoading}
            />
          </div>
          {showError('email') && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* No HP */}
        <div>
          <label htmlFor="no_hp" className="block text-sm font-medium text-gray-700 mb-2">
            No. HP
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              id="no_hp"
              name="no_hp"
              value={formData.no_hp}
              onChange={handleChange}
              onBlur={() => handleBlur('no_hp')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${showError('no_hp') ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="08xxxxxxxxxx"
              disabled={isLoading}
            />
          </div>
          {showError('no_hp') && (
            <p className="mt-1 text-sm text-red-600">{errors.no_hp}</p>
          )}
        </div>
      </div>

      {/* Jenis Kelamin */}
      <div>
        <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-gray-700 mb-2">
          Jenis Kelamin
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            id="jenis_kelamin"
            name="jenis_kelamin"
            value={formData.jenis_kelamin || ''}
            onChange={handleChange}
            onBlur={() => handleBlur('jenis_kelamin')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">Pilih jenis kelamin</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alamat */}
      <div>
        <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-2">
          Alamat
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <textarea
            id="alamat"
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            onBlur={() => handleBlur('alamat')}
            rows={3}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan alamat lengkap"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>{initialData ? 'Update' : 'Simpan'}</span>
          )}
        </button>
      </div>
    </form>
  );
}