'use client';

import React, { useEffect } from 'react';
import { useModal, cn } from '@/core';
import { X, AlertTriangle, Info } from 'lucide-react';

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function ModalProvider() {
  // Mengambil global state modal
  const { isOpen, data, close } = useModal();

  // Prevent body scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  // Cek apakah ini tipe Confirm Modal
  const isConfirmModal = typeof data.onConfirm === 'function';
  const isLoading = data.isLoading || false;

  // --- RENDER 1: CONFIRM MODAL UI ---
  if (isConfirmModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) {
            close();
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
          <div className="p-6">
            {/* Icon Section */}
            {data.type === 'danger' && (
              <div className="text-red-600 mb-4 flex justify-center">
                <AlertTriangle className="w-12 h-12" />
              </div>
            )}
            {data.type === 'warning' && (
              <div className="text-yellow-500 mb-4 flex justify-center">
                <AlertTriangle className="w-12 h-12" />
              </div>
            )}
            {data.type === 'info' && (
              <div className="text-blue-600 mb-4 flex justify-center">
                <Info className="w-12 h-12" />
              </div>
            )}

            <h2 className="text-xl font-semibold mb-2 text-center text-gray-900">
              {data.title || 'Konfirmasi'}
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {data.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={close}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {data.cancelText || 'Batal'}
              </button>
              <button
                onClick={data.onConfirm}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center disabled:opacity-75',
                  data.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    data.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-blue-600 hover:bg-blue-700'
                )}
              >
                {isLoading ? 'Loading...' : (data.confirmText || 'Ya, Lanjutkan')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: STANDARD CONTENT MODAL ---
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        const canClose = data.closeOnOverlayClick !== false;
        if (e.target === e.currentTarget && canClose) {
          close();
        }
      }}
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl relative animate-in zoom-in-95 duration-200 w-full max-h-[90vh] overflow-y-auto',
          sizeClasses[data.size || 'md']
        )}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-0">
          {data.content}
        </div>
      </div>
    </div>
  );
}