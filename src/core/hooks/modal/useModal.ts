'use client';

import { useState, useCallback } from 'react';

interface UseModalOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

type ModalStatus = 'idle' | 'success' | 'error';

export function useModal<T = null>(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState<boolean>(options.defaultOpen ?? false);
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const open = useCallback(
    (modalData?: T) => {
      setIsOpen(true);
      if (modalData !== undefined) {
        setData(modalData);
      }
      setStatus('idle');
      setMessage(null);
      options.onOpen?.();
    },
    [options]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    setStatus('idle');
    setMessage(null);
    options.onClose?.();
  }, [options]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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
