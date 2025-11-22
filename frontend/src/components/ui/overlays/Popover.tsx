import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside, cn } from '@/core';

interface PopoverProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Popover: React.FC<PopoverProps> = ({
    content, children, className, position = 'bottom'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useClickOutside(popoverRef, (event) => {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    });

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = rect.bottom + scrollY + 8;
            let left = rect.left + scrollX;

            if (position === 'top') {
                top = rect.top + scrollY - 8;
            } else if (position === 'left') {
                top = rect.top + scrollY;
                left = rect.left + scrollX - 8;
            } else if (position === 'right') {
                top = rect.top + scrollY;
                left = rect.right + scrollX + 8;
            }

            setCoords({ top, left });
        }
    }, [isOpen, position]);

    return (
        <div className="relative inline-block" ref={triggerRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {children}
            </div>
            {isOpen && createPortal(
                <div
                    ref={popoverRef}
                    style={{ top: coords.top, left: coords.left }}
                    className={cn(
                        'absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3',
                        'animate-in fade-in zoom-in-95 duration-200',
                        className
                    )}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};