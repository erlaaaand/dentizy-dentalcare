import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    onFilesSelect?: (files: File[]) => void;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    containerClassName?: string;
}

export default function FileUpload({
    accept,
    multiple = false,
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 5,
    onFilesSelect,
    label,
    error,
    hint,
    disabled,
    required,
    className,
    containerClassName
}: FileUploadProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

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
        setSelectedFiles(multiple ? [...selectedFiles, ...fileArray].slice(0, maxFiles) : fileArray);
        onFilesSelect?.(fileArray);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFilesSelect?.(newFiles);
    };

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    return (
        <div className={cn('w-full', containerClassName)}>
            {label && (
                <label className={cn(
                    'block text-sm font-medium text-gray-700 mb-1',
                    disabled && 'text-gray-400'
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
                    disabled && 'cursor-not-allowed opacity-60',
                    !disabled && 'hover:border-gray-400',
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
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold text-blue-600">Klik untuk upload</span> atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        {accept || 'Semua tipe file'} (Max. {formatFileSize(maxSize)})
                    </p>
                </div>
            </div>

            {(error || uploadError) && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error || uploadError}
                </p>
            )}

            {hint && !error && !uploadError && (
                <p className="mt-1 text-sm text-gray-500">{hint}</p>
            )}

            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="ml-3 text-red-600 hover:text-red-800 transition-colors"
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