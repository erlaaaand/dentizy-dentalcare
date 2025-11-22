// ========================================
// frontend/src/components/ui/layout/header/useDropdownAnimation.tsx
// ========================================
import { useState, useRef } from 'react';

export const useDropdownAnimation = (animationDuration = 300) => {
    const [isMounted, setIsMounted] = useState(false);
    const [animationClass, setAnimationClass] = useState('animate-slide-down');
    const isClosingRef = useRef(false);

    const openDropdown = () => {
        if (isClosingRef.current || isMounted) return;
        setAnimationClass('animate-slide-down');
        setIsMounted(true);
    };

    const closeDropdown = (exitDir: 'up' | 'down' = 'up') => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        const exitClass = exitDir === 'down' ? 'animate-slide-down-exit' : 'animate-slide-up-exit';
        setAnimationClass(exitClass);

        setTimeout(() => {
            setIsMounted(false);
            isClosingRef.current = false;
            setAnimationClass('animate-slide-down');
        }, animationDuration);
    };

    const toggleDropdown = (isOpen: boolean) => {
        if (isOpen) openDropdown();
        else if (isMounted) closeDropdown();
    };

    return {
        isMounted,
        animationClass,
        toggleDropdown,
        closeDropdown,
    };
};