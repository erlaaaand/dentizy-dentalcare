import { useCallback } from 'react';

interface UseFieldProps<T> {
  name: keyof T;
  value: unknown;
  error?: string;
  touched?: boolean;
  onChange: (name: keyof T) => (value: unknown) => void;
  onBlur: (name: keyof T) => () => void;
}

export function useField<T>(props: UseFieldProps<T>) {
  const { name, value, error, touched, onChange, onBlur } = props;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onChange(name)(e.target.value);
    },
    [name, onChange]
  );

  const handleBlur = useCallback(() => {
    onBlur(name)();
  }, [name, onBlur]);

  const showError = touched && error;

  return {
    name: String(name),
    value: value || '',
    error: showError ? error : undefined,
    onChange: handleChange,
    onBlur: handleBlur,
  };
}