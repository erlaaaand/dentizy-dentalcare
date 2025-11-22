import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside, cn } from '@/core'; // ✅ Import dari core

interface PopoverProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
}

const Popover: React.FC<PopoverProps> = ({ content, children, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const togglePopover = () => setIsOpen(!isOpen);

    // ✅ Menggunakan useClickOutside untuk menutup popover
    // Kita perlu mengecek klik diluar triggerRef DAN popoverRef (biasanya useClickOutside handle 1 ref, 
    // tapi kita bisa wrap logic sederhana atau gunakan ref pada container pembungkus jika memungkinkan.
    // Disini kita pakai logic manual di hook callback untuk cek target node)
    useClickOutside(popoverRef, (event) => {
        // Pastikan klik bukan pada trigger
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    });

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 8, // jarak 8px
                left: rect.left + window.scrollX,
            });
        }
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={triggerRef}>
            <div onClick={togglePopover} className="cursor-pointer">
                {children}
            </div>
            {isOpen &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{ top: position.top, left: position.left }}
                        className={cn(
                            'absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 animate-in fade-in zoom-in-95 duration-200',
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

export default Popover;