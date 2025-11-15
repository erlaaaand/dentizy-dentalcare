import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PopoverProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
}

const Popover: React.FC<PopoverProps> = ({ content, children, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const togglePopover = () => setIsOpen(!isOpen);

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
                        style={{ top: position.top, left: position.left }}
                        className={`absolute z-50 bg-white border border-gray-200 rounded shadow-lg p-3 ${className}`}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default Popover;