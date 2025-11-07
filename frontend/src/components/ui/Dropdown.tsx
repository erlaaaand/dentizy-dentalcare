import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
    id: string;
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface AccordionProps {
    items: AccordionItem[];
    allowMultiple?: boolean;
    defaultOpen?: string[];
    className?: string;
}

export default function Accordion({
    items,
    allowMultiple = false,
    defaultOpen = [],
    className
}: AccordionProps) {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

    const toggleItem = (id: string) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(id)
                    ? prev.filter(item => item !== id)
                    : [...prev, id]
            );
        } else {
            setOpenItems(prev =>
                prev.includes(id) ? [] : [id]
            );
        }
    };

    const isOpen = (id: string) => openItems.includes(id);

    return (
        <div className={cn('w-full divide-y divide-gray-200 border border-gray-200 rounded-lg', className)}>
            {items.map((item, index) => (
                <div key={item.id} className="group">
                    <button
                        onClick={() => !item.disabled && toggleItem(item.id)}
                        disabled={item.disabled}
                        className={cn(
                            'w-full flex items-center justify-between p-4 text-left transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                            item.disabled
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-gray-50',
                            index === 0 && 'rounded-t-lg',
                            index === items.length - 1 && !isOpen(item.id) && 'rounded-b-lg'
                        )}
                        aria-expanded={isOpen(item.id)}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            {item.icon && (
                                <span className="text-gray-500">{item.icon}</span>
                            )}
                            <span className="font-medium text-gray-900">{item.title}</span>
                        </div>
                        <svg
                            className={cn(
                                'w-5 h-5 text-gray-500 transition-transform duration-200',
                                isOpen(item.id) && 'rotate-180'
                            )}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div
                        className={cn(
                            'overflow-hidden transition-all duration-200',
                            isOpen(item.id) ? 'max-h-screen' : 'max-h-0'
                        )}
                    >
                        <div className="p-4 pt-0 text-gray-600">
                            {item.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}