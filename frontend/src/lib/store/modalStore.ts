import { create } from 'zustand';
import { ReactNode } from 'react';

export interface ModalConfig {
  id: string;
  title?: string;
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeable?: boolean;
  onClose?: () => void;
}

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ModalStore {
  modals: ModalConfig[];
  confirmModal: (ConfirmModalConfig & { id: string }) | null;
  
  openModal: (config: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  confirm: (config: ConfirmModalConfig) => Promise<boolean>;
  closeConfirm: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: [],
  confirmModal: null,
  
  openModal: (config) => {
    const id = `modal-${Date.now()}-${Math.random()}`;
    const modal: ModalConfig = {
      id,
      size: 'md',
      closeable: true,
      ...config,
    };
    
    set((state) => ({
      modals: [...state.modals, modal],
    }));
    
    return id;
  },
  
  closeModal: (id) => {
    const modal = get().modals.find((m) => m.id === id);
    
    if (modal?.onClose) {
      modal.onClose();
    }
    
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    }));
  },
  
  closeAllModals: () => {
    const { modals } = get();
    
    modals.forEach((modal) => {
      if (modal.onClose) {
        modal.onClose();
      }
    });
    
    set({ modals: [] });
  },
  
  confirm: (config) => {
    return new Promise<boolean>((resolve) => {
      const id = `confirm-${Date.now()}`;
      
      set({
        confirmModal: {
          ...config,
          id,
          confirmText: config.confirmText || 'Konfirmasi',
          cancelText: config.cancelText || 'Batal',
          type: config.type || 'info',
          onConfirm: async () => {
            await config.onConfirm();
            get().closeConfirm();
            resolve(true);
          },
          onCancel: () => {
            if (config.onCancel) {
              config.onCancel();
            }
            get().closeConfirm();
            resolve(false);
          },
        },
      });
    });
  },
  
  closeConfirm: () => {
    set({ confirmModal: null });
  },
}));