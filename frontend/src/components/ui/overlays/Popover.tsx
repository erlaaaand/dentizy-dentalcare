'use client';
import React, { useState, ReactNode, useRef, useEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside, cn } from '@/core';

interface PopoverProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: 'click' | 'hover';
    offset?: number;
}

export function Popover({
    content,
    children,
    className,
    position = 'bottom',
    trigger = 'click',
    offset = 8,
}: PopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number }>({
        top: 0,
        left: 0
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useClickOutside(popoverRef as RefObject<HTMLElement>, (event) => {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    });

    useEffect(() => {
        if (isOpen && triggerRef.current && isMounted) {
            const rect = triggerRef.current.getBoundingClientRect();
            const popoverWidth = 200;
            const popoverHeight = 100;

            let top = rect.bottom + offset;
            let left = rect.left + (rect.width / 2);

            switch (position) {
                case 'top':
                    top = rect.top - offset - popoverHeight;
                    break;
                case 'left':
                    top = rect.top + (rect.height / 2);
                    left = rect.left - offset - popoverWidth;
                    break;
                case 'right':
                    top = rect.top + (rect.height / 2);
                    left = rect.right + offset;
                    break;
                case 'bottom':
                default:
                    break;
            }

            setCoords({ top, left });
        }
    }, [isOpen, position, offset, isMounted]);

    const handleTrigger = () => {
        if (trigger === 'click') {
            setIsOpen(!isOpen);
        }
    };

    const handleMouseEnter = () => {
        if (trigger === 'hover') {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (trigger === 'hover') {
            setIsOpen(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="relative inline-block" ref={triggerRef}>
                {children}
            </div>
        );
    }

    return (
        <div
            className="relative inline-block"
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                onClick={handleTrigger}
                className={cn(
                    trigger === 'click' && 'cursor-pointer'
                )}
            >
                {children}
            </div>

            {isOpen && createPortal(
                <div
                    ref={popoverRef}
                    style={{
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        position: 'fixed',
                        transform: position === 'bottom' || position === 'top'
                            ? 'translateX(-50%)'
                            : position === 'left' || position === 'right'
                                ? 'translateY(-50%)'
                                : 'none',
                    }}
                    className={cn(
                        'z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3',
                        'animate-in fade-in zoom-in-95 duration-200',
                        className
                    )}
                    role="dialog"
                    aria-modal="true"
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
}

export default Popover;