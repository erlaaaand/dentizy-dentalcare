import { ButtonHTMLAttributes, ReactNode } from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button.styles';

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    /**
     * Menampilkan loading spinner dan menonaktifkan tombol
     */
    loading?: boolean;
    /**
     * Ikon opsional untuk ditampilkan
     */
    icon?: ReactNode;
    /**
     * Posisi ikon (kiri atau kanan)
     * @default 'left'
     */
    iconPosition?: 'left' | 'right';
    /**
     * Jika true, konten akan dirender sebagai child (berguna untuk Slot/Radix)
     */
    asChild?: boolean;
}

export interface ButtonGroupProps {
    children: ReactNode;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconPosition'> {
    icon: ReactNode;
    'aria-label': string;
}