'use client';

import React from 'react';
import { useAuth } from '@domains/auth/hooks/useAuth';
import { LoadingSpinner } from '@components/ui';
import { usePatients } from '../hooks/usePatients';

// Context untuk kompatibilitas (jika masih ada komponen yang butuh context)
const PatientsContext = React.createContext<ReturnType<typeof usePatients> | null>(null);

export const PatientsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading: authLoading } = useAuth();
    const patientsData = usePatients();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Jika tidak butuh context, langsung return children dengan hook
    if (!user) {
        return <>{children}</>;
    }

    return (
        <PatientsContext.Provider value={patientsData}>
            {children}
        </PatientsContext.Provider>
    );
};

// Legacy hook untuk kompatibilitas
export const usePatientsContext = () => {
    const context = React.useContext(PatientsContext);
    if (!context) {
        throw new Error('usePatientsContext must be used within PatientsProvider');
    }
    return context;
};