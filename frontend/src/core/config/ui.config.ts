// frontend/src/core/config/ui.config.ts
export const UI_CONFIG = {
  TOAST: {
    DURATION: 3000,
    POSITION: 'top-right' as const,
    MAX_TOASTS: 3,
  },
  MODAL: {
    ANIMATION_DURATION: 200,
    BACKDROP_OPACITY: 0.5,
  },
  TABLE: {
    DEFAULT_PAGE_SIZE: 10,
    SHOW_SIZE_CHANGER: true,
    SHOW_QUICK_JUMPER: true,
  },
  SIDEBAR: {
    WIDTH: 256,
    COLLAPSED_WIDTH: 80,
  },
  THEME: {
    DEFAULT: 'light' as const,
    COLORS: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
      info: '#1890ff',
    },
  },
} as const;