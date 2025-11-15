// frontend/src/components/features/patients/PatientSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from '@/core/types/api';
import * as patientService from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { PatientCard } from './PatientCard';
import { Search, X } from 'lucide-react';

interface PatientSearchProps {
    onSelect: (patient: Patient) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export function PatientSearch({ onSelect, placeholder = 'Cari pasien...', autoFocus = false }: PatientSearchProps) {
    const [query, setQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            searchPatients(debouncedQuery);
        } else {
            setPatients([]);
            setShowResults(false);
        }
    }, [debouncedQuery]);

    const searchPatients = async (searchQuery: string) => {
        setLoading(true);
        try {
            const results = await patientService.searchPatients(searchQuery);
            setPatients(results.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (patient: Patient) => {
        onSelect(patient);
        setQuery('');
        setPatients([]);
        setShowResults(false);
    };

    const handleClear = () => {
        setQuery('');
        setPatients([]);
        setShowResults(false);
    };

    return (
        <div className="relative">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (patients.length > 0) setShowResults(true);
                    }}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {patients.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            {loading ? 'Mencari...' : 'Tidak ada pasien ditemukan'}
                        </div>
                    ) : (
                        <div className="p-2 space-y-2">
                            {patients.map((patient) => (
                                <PatientCard
                                    key={patient.id}
                                    patient={patient}
                                    onClick={() => handleSelect(patient)}
                                    showContact={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop */}
            {showResults && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowResults(false)}
                />
            )}
        </div>
    );
}