'use client';

import React from 'react';
import PatientsTable from './components/PatientsTable';

const PatientsTableComponent = (PatientsTable as unknown) as React.ComponentType<any>;

export default function PatientsPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 shadow-lg rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                            Data Pasien
                        </h1>
                        <p className="text-indigo-100 mt-1">
                            Kelola data pasien
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        // onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-indigo-50 transition"
                    >
                        + Tambahkan Pasien Baru
                    </button>
                </div>
            </header>
            
            <div className="bg-white rounded-xl shadow-md p-6">
                <PatientsTableComponent />
            </div>
        </div>
    );
}