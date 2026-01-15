import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: 'sm' | 'md' | 'lg'; // ganti type menjadi string literal
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'placeholder'> {
    placeholder?: string;
}

// Password Input Component
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
    showPasswordToggle?: boolean;
}
