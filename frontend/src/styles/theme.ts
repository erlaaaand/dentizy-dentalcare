// frontend/src/styles/theme.ts
export const theme = {
  colors: {
    primary: {
      50: '#e8f3fb',
      100: '#d1e7f7',
      200: '#a3cff0',
      300: '#77afe2', // Primary
      400: '#6b9dcb',
      500: '#5f8cb4',
      600: '#537a9e',
      700: '#476987',
      800: '#3a5770',
      900: '#2d4559',
    },
    accent: {
      light: '#8fc4ea',
      main: '#77afe2',
      dark: '#5f8cb4',
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #77afe2 0%, #5f8cb4 100%)',
    soft: 'linear-gradient(135deg, #e8f3fb 0%, #d1e7f7 100%)',
    dark: 'linear-gradient(135deg, #537a9e 0%, #476987 100%)',
  },
  animations: {
    subtle: 'transition-all duration-300 ease-in-out',
    smooth: 'transition-all duration-500 ease-out',
  }
};
