// forms/index.ts

// --- Checkbox ---
export { default as Checkbox, CheckboxGroup } from './checkbox';
export type { CheckboxProps, CheckboxGroupProps } from './checkbox';

// --- Date Picker ---
export {
    DatePicker,
    AppointmentDatePicker,
    BirthDatePicker,
    DatePickerContainer,
    DateRangePicker
} from './date-picker';
export type {
    DatePickerProps,
    AppointmentDatePickerProps,
    BirthDatePickerProps,
    DatePickerContainerProps,
    DateRangePickerProps
} from './date-picker';

// --- File Upload ---
export {
    FileUpload,
    FileUploadContainer,
    PatientDocumentUpload
} from './file-upload';
export type {
    FileUploadProps,
    FileUploadContainerProps,
    PatientDocumentUploadProps,
    TreatmentPhotoUploadProps,
    UploadedFile
} from './file-upload';

// --- Input ---
export { default as Input, PasswordInput } from './input';
export type { InputProps, PasswordInputProps } from './input';

// --- Radio Group ---
// Note: RadioGroup tidak memiliki index.ts di foldernya, jadi import langsung dari filenya
export { default as RadioGroup } from './radio-group/RadioGroup';
export type { RadioGroupProps, RadioOption } from './radio-group/RadioGroup';

// --- Search Input ---
export {
    default as SearchInput,
    GlobalSearchInput,
    MinimalSearchInput,
    QuickSearchInput,
    SearchInputGroup,
    SearchWithResults,
    TableSearchInput
} from './search-input';
export type {
    SearchInputProps,
    SearchInputGroupProps,
    SearchWithResultsProps,
    TableSearchInputProps
} from './search-input';

// --- Select ---
export {
    default as Select,
    CompactSelect,
    FormSelect,
    SearchableSelect,
    SelectGroup,
    StatusSelect
} from './select';
export type {
    SelectProps,
    SelectGroupProps,
    SelectOption,
    SearchableSelectProps,
    StatusSelectProps
} from './select';

// --- Textarea ---
export {
    default as Textarea,
    AutoResizeTextarea,
    CompactTextarea,
    DescriptionTextarea,
    FormTextarea,
    FormattedTextarea,
    NotesTextarea,
    ReadonlyTextarea
} from './text-area';
export type {
    TextareaProps,
    DescriptionTextareaProps,
    FormattedTextareaProps,
    NotesTextareaProps
} from './text-area';

// --- Time Picker ---
// Note: TimePicker tidak memiliki index.ts di foldernya
export { default as TimePicker } from './time-picker/TimePicker';
export type { TimePickerProps } from './time-picker/TimePicker';