import { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    containerClassName?: string;
    showCharCount?: boolean;
    maxLength?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'filled';
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}


export const formatLabels = {
    bold: '**tebal**',
    italic: '_miring_',
    list: '- list item',
    link: '[teks](url)',
    code: '`kode`',
};

type AllowedFormat = keyof typeof formatLabels;

export interface FormattedTextareaProps
    extends Omit<TextareaProps, 'hint'> {
    formattingHint?: string;
    allowedFormats?: AllowedFormat[];
}

export interface DescriptionTextareaProps
    extends Omit<TextareaProps, 'maxLength' | 'showCharCount'> {
    maxLength?: number;
    showCharCount?: boolean;
}

export interface NotesTextareaProps
    extends Omit<TextareaProps, 'maxLength' | 'showCharCount' | 'resize'> {
    maxLength?: number;
    showCharCount?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
