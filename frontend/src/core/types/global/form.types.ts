// Global form types
export type FormFieldValue = string | number | boolean | Date | null | undefined;

export interface FormField {
  name: string;
  value: FormFieldValue;
  error?: string;
  touched: boolean;
}

export interface FormSubmitHandler<T> {
  (values: T): Promise<void> | void;
}

export interface FormValidation<T> {
  (values: T): Partial<Record<keyof T, string>> | Promise<Partial<Record<keyof T, string>>>;
}