'use client';

import React from 'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CreateAppointmentModal({ isOpen, onClose, onSuccess }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Buat Janji Temu Baru</h2>
                {/* Di sini Anda akan membangun form */}
                <p>Formulir akan ada di sini...</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600">Batal</button>
                    <button onClick={onSuccess} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
                </div>
            </div>
        </div>
    );
}