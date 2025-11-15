'use client';

import React, { useState } from 'react';
import { MedicalRecord } from '@/core/types/api';
import {
    FileText,
    Calendar,
    User,
    ChevronDown,
    ChevronUp,
    Printer,
    Download,
    Eye,
} from 'lucide-react';

interface MedicalRecordListProps {
    records: MedicalRecord[];
    isLoading?: boolean;
    onViewDetail?: (record: MedicalRecord) => void;
    onEdit?: (record: MedicalRecord) => void;
    onPrint?: (record: MedicalRecord) => void;
    onExport?: (record: MedicalRecord) => void;
}

export function MedicalRecordList({
    records,
    isLoading = false,
    onViewDetail,
    onEdit,
    onPrint,
    onExport,
}: MedicalRecordListProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Memuat rekam medis...</p>
                </div>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada rekam medis
                    </h3>
                    <p className="text-gray-600">
                        Rekam medis akan muncul setelah pemeriksaan pasien
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {records.map((record) => {
                const isExpanded = expandedIds.has(record.id.toString());

                return (
                    <div
                        key={record.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-gray-900">
                                            {new Date(record.created_at).toLocaleDateString(
                                                'id-ID',
                                                {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </span>
                                    </div>

                                    {record.appointment && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span>
                                                {record.appointment.patient?.nama_lengkap}
                                            </span>
                                        </div>
                                    )}

                                    {record.appointment?.keluhan && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                            {record.appointment.keluhan}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => toggleExpand(record.id.toString())}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Preview (Always Visible) */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 font-medium mb-1">
                                        Subjektif (S)
                                    </p>
                                    <p className="text-gray-900 line-clamp-2">
                                        {record.subjektif || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-medium mb-1">
                                        Assessment (A)
                                    </p>
                                    <p className="text-gray-900 line-clamp-2">
                                        {record.assessment || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                                {/* Objektif */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <span className="text-green-600 font-bold text-sm">
                                                O
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900">
                                            Objektif - Hasil Pemeriksaan
                                        </h4>
                                    </div>
                                    <div className="pl-10 text-gray-700 whitespace-pre-wrap">
                                        {record.objektif || '-'}
                                    </div>
                                </div>

                                {/* Assessment */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <span className="text-purple-600 font-bold text-sm">
                                                A
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900">
                                            Assessment - Diagnosis
                                        </h4>
                                    </div>
                                    <div className="pl-10 text-gray-700 whitespace-pre-wrap">
                                        {record.assessment || '-'}
                                    </div>
                                </div>

                                {/* Plan */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <span className="text-orange-600 font-bold text-sm">
                                                P
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900">
                                            Plan - Rencana Perawatan
                                        </h4>
                                    </div>
                                    <div className="pl-10 text-gray-700 whitespace-pre-wrap">
                                        {record.plan || '-'}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                                    {onViewDetail && (
                                        <button
                                            onClick={() => onViewDetail(record)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Lihat Detail
                                        </button>
                                    )}

                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(record)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )}

                                    {onPrint && (
                                        <button
                                            onClick={() => onPrint(record)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                                        >
                                            <Printer className="w-4 h-4" />
                                            Cetak
                                        </button>
                                    )}

                                    {onExport && (
                                        <button
                                            onClick={() => onExport(record)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export
                                        </button>
                                    )}
                                </div>

                                {/* Metadata */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                                        <div>
                                            <p className="font-medium mb-1">Dibuat pada</p>
                                            <p>
                                                {new Date(
                                                    record.created_at
                                                ).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        {record.updated_at && (
                                            <div>
                                                <p className="font-medium mb-1">
                                                    Diupdate pada
                                                </p>
                                                <p>
                                                    {new Date(
                                                        record.updated_at
                                                    ).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        )}
                                        {record.user_id_staff && (
                                            <div>
                                                <p className="font-medium mb-1">Dokter</p>
                                                <p>{record.user_staff?.nama_lengkap}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium mb-1">ID Rekam Medis</p>
                                            <p className="font-mono">{record.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}