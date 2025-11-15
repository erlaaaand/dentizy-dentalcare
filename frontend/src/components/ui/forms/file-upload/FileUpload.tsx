// components/ui/forms/FileUpload.tsx
'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/core/utils';
import { formatFileSize, getFileIcon } from '@/core/utils';
import { FileUploadContainer } from './FileUploadContainer';
import { PatientDocumentUpload } from './PatientDocumentUpload';
import { TreatmentPhotoUpload } from './TreatmentPhotoUpload';
import { FileUploadProps } from './file-upload.types';
import { sizeClasses, variantClasses } from './file-upload.styles';

export function FileUpload({
    accept,
    multiple = false,
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 5,
    onFilesSelect,
    label,
    error,
    hint,
    disabled = false,
    required = false,
    size = 'md',
    variant = 'default',
    className,
    containerClassName
}: FileUploadProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    const validateFiles = (files: File[]) => {
        const errors: string[] = [];

        if (!multiple && files.length > 1) {
            errors.push('Hanya dapat mengunggah 1 file');
        }

        if (multiple && files.length > maxFiles) {
            errors.push(`Maksimal ${maxFiles} file`);
        }

        files.forEach(file => {
            if (file.size > maxSize) {
                errors.push(`${file.name}: ukuran melebihi ${formatFileSize(maxSize)}`);
            }
        });

        return errors;
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const errors = validateFiles(fileArray);

        if (errors.length > 0) {
            setUploadError(errors.join(', '));
            return;
        }

        setUploadError('');
        const newFiles = multiple ? [...selectedFiles, ...fileArray].slice(0, maxFiles) : fileArray;
        setSelectedFiles(newFiles);
        onFilesSelect?.(newFiles);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;
        handleFiles(e.dataTransfer.files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset input value to allow uploading same file again
        if (e.target.value) e.target.value = '';
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFilesSelect?.(newFiles);
    };

    const openFileDialog = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    return (
        <div className={cn('w-full', containerClassName)}>
            {/* Label */}
            {label && (
                <label className={cn(
                    'block font-medium text-gray-700',
                    sizeClass.label,
                    disabled && 'text-gray-400'
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
                className={cn(
                    'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
                    sizeClass.container,
                    dragActive ? variantClass.active : variantClass.base,
                    disabled ? variantClass.disabled : variantClass.hover,
                    error && 'border-red-500',
                    className
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    disabled={disabled}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center text-center">
                    <div className={cn('text-gray-400 mb-3', sizeClass.icon)}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <p className={cn('text-gray-600 mb-1', sizeClass.text)}>
                        <span className={cn('font-semibold', !disabled && 'text-blue-600')}>
                            Klik untuk upload
                        </span> atau drag and drop
                    </p>
                    <p className={cn('text-gray-500', sizeClass.text)}>
                        {accept || 'Semua tipe file'} (Max. {formatFileSize(maxSize)})
                        {multiple && maxFiles > 1 && ` • Maks. ${maxFiles} file`}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {(error || uploadError) && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error || uploadError}
                </p>
            )}

            {/* Hint Message */}
            {hint && !error && !uploadError && (
                <p className="mt-1 text-sm text-gray-500">{hint}</p>
            )}

            {/* File List */}
            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 flex-shrink-0">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                disabled={disabled}
                                className={cn(
                                    'ml-3 transition-colors flex-shrink-0',
                                    disabled ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'
                                )}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

FileUpload.Container = FileUploadContainer;
FileUpload.PatientDocument = PatientDocumentUpload;
FileUpload.TreatmentPhoto = TreatmentPhotoUpload;