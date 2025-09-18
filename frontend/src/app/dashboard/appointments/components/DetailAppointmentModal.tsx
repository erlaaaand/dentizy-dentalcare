'use client';

import React, { useState, useEffect } from 'react';
import { Appointment } from '@/types/api';
import { completeAppointment, cancelAppointment } from '@/lib/api/appointmentService';
import { formatDate, formatTime } from '@/lib/utils';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment;
    onActionSuccess: () => void;
};

export default function DetailAppointmentModal({ isOpen, onClose, appointment, onActionSuccess }: ModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Delay untuk animasi masuk yang smooth
            setTimeout(() => setShowContent(true), 50);
            // Reset states
            setError(null);
            setIsSubmitting(false);
        } else if (isVisible) {
            // Animasi keluar
            setShowContent(false);
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen, isVisible]);

    // Cleanup saat unmount
    useEffect(() => {
        return () => {
            setIsVisible(false);
            setShowContent(false);
        };
    }, []);

    if (!isVisible) return null;

    const handleComplete = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await completeAppointment(appointment.id);
            onActionSuccess();
            handleClose();
        } catch (err) {
            setError('Gagal menandai janji temu sebagai selesai.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Apakah Anda yakin ingin membatalkan janji temu ini?')) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await cancelAppointment(appointment.id);
            onActionSuccess();
            handleClose();
        } catch (err) {
            setError('Gagal membatalkan janji temu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setShowContent(false);
        setTimeout(() => onClose(), 300);
    };

    // Fungsi untuk menentukan warna status yang selaras
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'dijadwalkan':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'selesai':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'dibatalkan':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    // Komponen Loading Spinner yang reusable
    const LoadingSpinner = ({ className = "h-4 w-4" }: { className?: string }) => (
        <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
                showContent 
                    ? 'bg-slate-900/60 backdrop-blur-sm' 
                    : 'bg-slate-900/0 backdrop-blur-none'
            }`} 
            onClick={handleClose}
        >
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-out transform ${
                    showContent 
                        ? 'scale-100 opacity-100 translate-y-0' 
                        : 'scale-95 opacity-0 translate-y-4'
                }`} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header dengan gradient yang lebih subtle */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Detail Janji Temu</h2>
                            <p className="text-sm text-slate-600 mt-0.5">ID: {appointment.id}</p>
                        </div>
                        <button 
                            onClick={handleClose} 
                            className="text-slate-400 hover:text-slate-600 transition-colors duration-200 rounded-full p-2 hover:bg-slate-100 group"
                            aria-label="Tutup modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Content dengan spacing yang konsisten */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pasien */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300/60 transition-colors duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pasien</label>
                                    <p className="text-lg font-semibold text-slate-800 leading-tight">{appointment.patient.nama_lengkap}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* No. Rekam Medis */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300/60 transition-colors duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">No. Rekam Medis</label>
                                    <p className="text-sm font-medium text-slate-700 font-mono bg-slate-100 px-2 py-1 rounded mt-1 inline-block">{appointment.patient.nomor_rekam_medis}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Dokter */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300/60 transition-colors duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dokter</label>
                                    <p className="text-lg font-semibold text-slate-800 leading-tight">{appointment.doctor.nama_lengkap}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Jadwal */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300/60 transition-colors duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jadwal</label>
                                    <p className="text-lg font-semibold text-slate-800 leading-tight">
                                        {formatDate(appointment.tanggal_janji)}
                                    </p>
                                    <p className="text-sm text-amber-600 font-medium">
                                        {formatTime(appointment.jam_janji)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Keluhan - Full Width */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Keluhan</label>
                                <p className="text-slate-700 mt-2 leading-relaxed">
                                    {appointment.keluhan || <span className="text-slate-400 italic">Tidak ada keluhan tercatat</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Status */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status Janji Temu</label>
                                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold mt-2 border ${getStatusColor(appointment.status)}`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                        appointment.status.toLowerCase() === 'dijadwalkan' ? 'bg-blue-500' :
                                        appointment.status.toLowerCase() === 'selesai' ? 'bg-emerald-500' :
                                        appointment.status.toLowerCase() === 'dibatalkan' ? 'bg-red-500' : 'bg-slate-500'
                                    }`}></div>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl animate-pulse">
                            <div className="flex items-start space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button 
                        onClick={handleClose} 
                        className="px-6 py-2.5 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[100px]"
                        disabled={isSubmitting}
                    >
                        Tutup
                    </button>
                    
                    {appointment.status === 'dijadwalkan' && (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[120px]"
                            >
                                {isSubmitting ? <LoadingSpinner className="h-4 w-4 mr-2" /> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                }
                                Batalkan
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[120px]"
                            >
                                {isSubmitting ? <LoadingSpinner className="h-4 w-4 mr-2" /> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                }
                                Selesai
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}