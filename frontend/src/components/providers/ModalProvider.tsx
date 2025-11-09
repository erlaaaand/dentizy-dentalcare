'use client';

import React, { useEffect } from 'react';
import { useModalStore } from '@/lib/store/modalStore';
import { X, AlertTriangle, Info, Loader2 } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function ModalProvider() {
  const { modals, closeModal, confirmModal, closeConfirm, isLoading } = useModalStore();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modals.length > 0 || confirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modals.length, confirmModal]);

  return (
    <>
      {/* ... (JSX untuk Regular Modals tidak berubah) ... */}

      {/* Confirm Modal */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            // 3. Cegah penutupan overlay saat loading
            if (e.target === e.currentTarget && !isLoading) {
              confirmModal.onCancel?.();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* ... (Icon, Title, Message JSX tidak berubah) ... */}
              {confirmModal.type === 'danger' && (
                <div className="text-red-600 mb-4">
                  <AlertTriangle className="w-12 h-12 mx-auto" />
                </div>
              )}

              {confirmModal.type === 'warning' && (
                <div className="text-yellow-500 mb-4">
                  <AlertTriangle className="w-12 h-12 mx-auto" />
                </div>
              )}

              {confirmModal.type === 'info' && (
                <div className="text-blue-600 mb-4">
                  <Info className="w-12 h-12 mx-auto" />
                </div>
              )}

              {/* === Title dan Message === */}
              <h2 className="text-xl font-semibold mb-2">{confirmModal.title}</h2>
              <p className="text-gray-600 mb-6">{confirmModal.message}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => confirmModal.onCancel?.()}
                  disabled={isLoading} // 4. Tambahkan disabled
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={() => confirmModal.onConfirm()}
                  disabled={isLoading} // 5. Tambahkan disabled
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center ${confirmModal.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmModal.type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                  {/* 6. Tambahkan UI loading */}
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    confirmModal.confirmText
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}