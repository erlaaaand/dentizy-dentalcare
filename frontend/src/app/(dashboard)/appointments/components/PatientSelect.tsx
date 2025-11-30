'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { usePatientsControllerSearch } from '@/core/api/generated/patients/patients';
import { useDebounce } from '@/core'; // Pastikan hook ini ada atau gunakan setTimeout manual

interface PatientSelectProps {
    value?: number;
    onChange: (patientId: number, patientData: any) => void;
    error?: string;
    disabled?: boolean;
}

export default function PatientSelect({ value, onChange, error, disabled }: PatientSelectProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search term 500ms
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Fetch API
    const { data: searchResults, isLoading } = usePatientsControllerSearch(
        { search: debouncedSearch, is_active: true },
        { query: { enabled: debouncedSearch.length >= 2 } }
    );

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle selection
    const handleSelect = (patient: any) => {
        setSelectedLabel(`${patient.nama_lengkap} (${patient.nomor_rekam_medis})`);
        onChange(patient.id, patient);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        setSelectedLabel('');
        onChange(0, null); // 0 or undefined
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Pasien <span className="text-red-500">*</span>
            </label>

            {/* Selected View */}
            {value && selectedLabel ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-blue-900">{selectedLabel}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={disabled}
                        className="p-1 hover:bg-blue-200 rounded text-blue-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                /* Search Input */
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        placeholder="Ketik nama, NIK, atau No. RM..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        disabled={disabled}
                    />
                </div>
            )}

            {/* Dropdown Results */}
            {isOpen && searchTerm.length >= 2 && !value && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Mencari...</div>
                    ) : searchResults && (searchResults as any[]).length > 0 ? (
                        <ul>
                            {(searchResults as any[]).map((patient: any) => (
                                <li
                                    key={patient.id}
                                    onClick={() => handleSelect(patient)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900">{patient.nama_lengkap}</div>
                                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                        <span className="bg-gray-100 px-1 rounded">RM: {patient.nomor_rekam_medis}</span>
                                        <span>NIK: {patient.nik || '-'}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Pasien tidak ditemukan.
                            <br />
                            <span className="text-xs">Pastikan pasien sudah terdaftar (aktif).</span>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}