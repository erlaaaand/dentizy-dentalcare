'use client';

import React, { useEffect } from 'react';
import { useModalStore } from '@/lib/store/modalStore';
import { X, AlertTriangle, Info } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function ModalProvider() {
  const { modals, closeModal, confirmModal, closeConfirm } = useModalStore();
  
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
      {/* Regular Modals */}
      {modals.map((modal) => (
        <div
          key={modal.id}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && modal.closeable) {
              closeModal(modal.id);
            }
          }}
        >
          <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[modal.size || 'md']} max-h-[90vh] flex flex-col`}>
            {/* Header */}
            {modal.title && (
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {modal.title}
                </h2>
                {modal.closeable && (
                  <button
                    onClick={() => closeModal(modal.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {modal.content}
            </div>
          </div>
        </div>
      ))}
      
      {/* Confirm Modal */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              confirmModal.onCancel?.();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                {confirmModal.type === 'danger' ? (
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                ) : confirmModal.type === 'warning' ? (
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                )}
              </div>
              
              {/* Title & Message */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {confirmModal.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {confirmModal.message}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => confirmModal.onCancel?.()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={() => confirmModal.onConfirm()}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                    confirmModal.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmModal.type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}