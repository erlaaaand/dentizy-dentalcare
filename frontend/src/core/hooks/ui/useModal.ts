// frontend/src/core/hooks/ui/useModal.ts
import { useState, useCallback } from 'react';

interface UseModalOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useModal(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(options.defaultOpen || false);
  const [data, setData] = useState<any>(null);

  const open = useCallback((modalData?: any) => {
    setIsOpen(true);
    if (modalData !== undefined) {
      setData(modalData);
    }
    options.onOpen?.();
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    options.onClose?.();
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}