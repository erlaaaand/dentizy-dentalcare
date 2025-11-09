import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    label?: string;
    error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi...',
    disabled = false,
    className = '',
    label,
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        if (onChange) {
            onChange(optionValue);
        }
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div ref={dropdownRef} className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className={`
            w-full px-4 py-2 text-left bg-white border rounded-lg
            flex items-center justify-between
            transition-all duration-200
            ${disabled
                            ? 'bg-gray-100 cursor-not-allowed opacity-60'
                            : 'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        }
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
          `}
                >
                    <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                Tidak ada opsi tersedia
                            </div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => !option.disabled && handleSelect(option.value)}
                                    disabled={option.disabled}
                                    className={`
                    w-full px-4 py-2 text-left text-sm
                    transition-colors duration-150
                    ${option.disabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-900 hover:bg-blue-50 cursor-pointer'
                                        }
                    ${option.value === value ? 'bg-blue-100 font-medium' : ''}
                  `}
                                >
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Dropdown;