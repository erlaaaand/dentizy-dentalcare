import { useModalStore, ModalConfig } from '@/lib/store/modalStore';
import { ReactNode } from 'react';

/**
 * Hook for managing modals
 */
export function useModal() {
    const { openModal, closeModal, closeAllModals } = useModalStore();

    return {
        open: (config: Omit<ModalConfig, 'id'>) => {
            return openModal(config);
        },

        close: (id: string) => {
            closeModal(id);
        },

        closeAll: () => {
            closeAllModals();
        },

        openForm: <T = any>(
            title: string,
            FormComponent: React.ComponentType<{ onSubmit: (data: T) => void; onCancel: () => void; initialData?: T }>,
            {
                initialData,
                onSubmit,
                size = 'lg',
            }: {
                initialData?: T;
                onSubmit: (data: T) => void | Promise<void>;
                size?: ModalConfig['size'];
            }
        ) => {
            const modalId = openModal({
                title,
                size,
                content: (
                    <FormComponent
            onSubmit= { async(data) => {
                await onSubmit(data);
                closeModal(modalId);
            }
        }
            onCancel={() => closeModal(modalId)
    }
    initialData = { initialData }
        />
        ),
});

return modalId;
    },
  };
}