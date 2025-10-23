'use client';

import React from 'react';
import PatientsTable from './components/PatientsTable';

const PatientsTableComponent = (PatientsTable as unknown) as React.ComponentType<any>;

export default function PatientsPage({

}) {

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Daftar Pasien</h1>
            <PatientsTableComponent />
        </div>
    );
}