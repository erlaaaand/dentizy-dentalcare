import { useModalStore, ConfirmModalConfig } from '@/lib/store/modalStore';

/**
 * Hook for confirmation dialogs
 */
export function useConfirm() {
  const confirm = useModalStore((state) => state.confirm);
  
  return {
    confirm: (config: Omit<ConfirmModalConfig, 'onConfirm'> & { onConfirm: () => void | Promise<void> }) => {
      return confirm(config);
    },
    
    confirmDelete: (itemName: string, onConfirm: () => void | Promise<void>) => {
      return confirm({
        title: 'Konfirmasi Hapus',
        message: `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Hapus',
        cancelText: 'Batal',
        type: 'danger',
        onConfirm,
      });
    },
    
    confirmCancel: (onConfirm: () => void | Promise<void>) => {
      return confirm({
        title: 'Konfirmasi Pembatalan',
        message: 'Apakah Anda yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.',
        confirmText: 'Ya, Batalkan',
        cancelText: 'Tidak',
        type: 'warning',
        onConfirm,
      });
    },
    
    confirmAction: (title: string, message: string, onConfirm: () => void | Promise<void>) => {
      return confirm({
        title,
        message,
        confirmText: 'Ya',
        cancelText: 'Tidak',
        type: 'info',
        onConfirm,
      });
    },
  };
}