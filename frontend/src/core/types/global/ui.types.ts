// UI State Types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

export interface DrawerState {
  isOpen: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  toasts: ToastMessage[];
  modals: Record<string, ModalState>;
}