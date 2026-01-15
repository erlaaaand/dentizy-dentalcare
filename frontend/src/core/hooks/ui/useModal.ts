'use client';

import { useState, useCallback } from 'react';

interface UseModalOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useModal(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(options.defaultOpen || false);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const open = useCallback((modalData?: any) => {
    setIsOpen(true);
    if (modalData !== undefined) {
      setData(modalData);
    }
    setStatus('idle');     // tiap kali open modal baru → reset status
    setMessage(null);
    options.onOpen?.();
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    setStatus('idle');
    setMessage(null);
    options.onClose?.();
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const success = useCallback((msg: string) => {
    setStatus('success');
    setMessage(msg);
  }, []);

  const error = useCallback((msg: string) => {
    setStatus('error');
    setMessage(msg);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setStatus('idle');
    setMessage(null);
  }, []);

  return {
    isOpen,
    data,
    status,
    message,
    open,
    close,
    toggle,
    success,
    error,
    reset,
  };
}
