// API Component specific types
export interface ApiStateProps {
  loading?: boolean;
  error?: string | null;
  data?: unknown;
}

export interface LoadingStateProps {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorStateProps {
  error: string | null;
  onRetry?: () => void;
}

export interface EmptyStateProps {
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}