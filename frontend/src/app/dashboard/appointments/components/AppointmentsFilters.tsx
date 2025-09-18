'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    Calendar, 
    User, 
    CircleDot, 
    ChevronDown, 
    Filter, 
    X,
    Clock,
    CheckCircle2,
    XCircle,
    Pause,
    PlayCircle
} from 'lucide-react';

// --- Komponen Dropdown Kustom ---
type Option = {
    value: string;
    label: string;
    icon?: React.ReactNode;
};

type CustomSelectProps = {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    icon: React.ReactNode;
};

function CustomSelect({ options, value, onChange, placeholder, icon }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [mounted, setMounted] = useState(false);
    const selectedOption = options.find(option => option.value === value);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) {
                updateDropdownPosition();
            }
        };

        const handleResize = () => {
            if (isOpen) {
                updateDropdownPosition();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScroll, true);
            window.addEventListener("resize", handleResize);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, [isOpen]);

    const updateDropdownPosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownMaxHeight = 280;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top = rect.bottom + window.scrollY + 8;
        
        // Jika tidak cukup ruang di bawah, tampilkan di atas
        if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
            top = rect.top + window.scrollY - dropdownMaxHeight - 8;
        }

        setDropdownPosition({
            top,
            left: rect.left + window.scrollX,
            width: rect.width
        });
    };

    const toggleOpen = () => {
        if (!isOpen) {
            updateDropdownPosition();
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const dropdownContent = isOpen && mounted ? createPortal(
        <div 
            ref={dropdownRef}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl animate-fade-in-down"
            style={{ 
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 999999,
                maxHeight: '280px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
        >
            <div className="overflow-y-auto max-h-full">
                {options.map((option, index) => (
                    <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-all duration-150
                                   hover:bg-blue-50 hover:text-blue-700 
                                   ${index !== options.length - 1 ? 'border-b border-gray-50' : ''}
                                   ${index === 0 ? 'rounded-t-xl' : ''}
                                   ${index === options.length - 1 ? 'rounded-b-xl' : ''}
                                   ${option.value === value ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700'}`}
                    >
                        {option.icon && (
                            <span className="flex items-center justify-center w-5 h-5">
                                {option.icon}
                            </span>
                        )}
                        <span className="flex-grow">{option.label}</span>
                        {option.value === value && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                    </button>
                ))}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleOpen}
                    className={`w-full flex items-center px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm 
                               transition-all duration-200 hover:border-blue-300 hover:shadow-sm
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                               ${value ? 'border-blue-300 bg-blue-50/50' : 'text-gray-500'}
                               ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
                >
                    <span className="flex items-center justify-center w-5 h-5 mr-3 text-gray-400">
                        {icon}
                    </span>
                    <span className="flex-grow text-left truncate font-medium">
                        {selectedOption?.label || placeholder}
                    </span>
                    <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>
            </div>
            {dropdownContent}
        </>
    );
}

// --- Komponen Filter Utama (Di sini perbaikannya) ---
type Doctor = {
    id: number;
    nama_lengkap: string; // Sesuaikan dengan tipe data dari backend
};

// --- Komponen Filter Utama ---
type FilterProps = {
    doctors: Doctor[];
    onFilterChange: (filters: { date: string; doctorId: string; status: string }) => void;
}

export default function AppointmentFilters({ doctors, onFilterChange }: FilterProps) {
    const [filters, setFilters] = useState({
        date: '',
        doctorId: '',
        status: '',
    });

    const handleFilterChange = (name: string, value: string) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };
    
    const handleClearFilters = () => {
        const clearedFilters = { date: '', doctorId: '', status: '' };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters = filters.date || filters.doctorId || filters.status;

    const doctorOptions: Option[] = [
        { value: '', label: 'Semua Dokter', icon: <User className="w-4 h-4 text-gray-400" /> },
        // Gunakan `nama_lengkap` dari props `doctors`
        ...doctors.map(doc => ({ 
            value: doc.id.toString(), 
            label: doc.nama_lengkap, 
            icon: <User className="w-4 h-4 text-blue-500" />
        }))
    ];

    const statusOptions: Option[] = [
        { 
            value: '', 
            label: 'Semua Status', 
            icon: <CircleDot className="w-4 h-4 text-gray-400" /> 
        },
        { 
            value: 'dijadwalkan', 
            label: 'Dijadwalkan', 
            icon: <Clock className="w-4 h-4 text-amber-500" /> 
        },
        { 
            value: 'selesai', 
            label: 'Selesai', 
            icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> 
        },
        { 
            value: 'dibatalkan', 
            label: 'Dibatalkan', 
            icon: <XCircle className="w-4 h-4 text-red-500" /> 
        },
    ];

    const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'dijadwalkan':
                return 'bg-amber-100 text-amber-700';
            case 'berlangsung':
                return 'bg-blue-100 text-blue-700';
            case 'ditunda':
                return 'bg-orange-100 text-orange-700';
            case 'selesai':
                return 'bg-green-100 text-green-700';
            case 'dibatalkan':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100 rounded-t-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm">
                            <Filter className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Filter Janji Temu</h3>
                            {activeFiltersCount > 0 && (
                                <p className="text-xs text-blue-600 font-medium mt-0.5">
                                    {activeFiltersCount} filter aktif
                                </p>
                            )}
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                        >
                            <X className="w-3.5 h-3.5" />
                            Bersihkan Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Controls */}
            <div className="p-6 rounded-b-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Date Input */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Tanggal Janji Temu
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                            <input 
                                type="date"
                                name="date"
                                value={filters.date}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                                className={`w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm 
                                            text-gray-800 font-medium
                                            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                                            transition-all duration-200 hover:border-blue-300 hover:shadow-sm
                                            ${filters.date ? 'border-blue-300 bg-blue-50/50' : ''}`}
                            />
                        </div>
                    </div>
                    
                    {/* Doctor Select */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Dokter yang Bertugas
                        </label>
                        <CustomSelect
                            options={doctorOptions}
                            value={filters.doctorId}
                            onChange={(value) => handleFilterChange('doctorId', value)}
                            placeholder="Pilih dokter"
                            icon={<User className="w-4 h-4" />}
                        />
                    </div>
                    
                    {/* Status Select */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Status Janji Temu
                        </label>
                         <CustomSelect
                            options={statusOptions}
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            placeholder="Pilih status"
                            icon={<CircleDot className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-gray-600 mr-2">Filter aktif:</span>
                            {filters.date && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(filters.date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                    <button 
                                        onClick={() => handleFilterChange('date', '')}
                                        className="ml-1 hover:text-blue-900 p-0.5 rounded"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.doctorId && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-lg">
                                    <User className="w-3 h-3" />
                                    {doctorOptions.find(d => d.value === filters.doctorId)?.label}
                                    <button 
                                        onClick={() => handleFilterChange('doctorId', '')}
                                        className="ml-1 hover:text-green-900 p-0.5 rounded"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.status && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${getStatusBadgeColor(filters.status)}`}>
                                    {statusOptions.find(s => s.value === filters.status)?.icon}
                                    {statusOptions.find(s => s.value === filters.status)?.label}
                                    <button 
                                        onClick={() => handleFilterChange('status', '')}
                                        className="ml-1 hover:opacity-80 p-0.5 rounded"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fadeInDown 0.2s ease-out forwards;
                }

                input[type="date"]::-webkit-calendar-picker-indicator {
                    background: transparent;
                    bottom: 0;
                    color: transparent;
                    cursor: pointer;
                    height: auto;
                    left: 0;
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: auto;
                    z-index: 20;
                }

                input[type="date"]::-webkit-datetime-edit-text,
                input[type="date"]::-webkit-datetime-edit-month-field,
                input[type="date"]::-webkit-datetime-edit-day-field,
                input[type="date"]::-webkit-datetime-edit-year-field {
                    color: #374151;
                }
            `}</style>
        </div>
    );
}