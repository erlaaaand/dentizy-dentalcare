import * as ArrayUtils from './array/array.utils';
import * as DateUtils from './date/date.utils';
import * as FormatUtils from './date/format.utils';
import * as ObjectUtils from './object/object.utils';
import * as StorageUtils from './storage/storage.utils';
import * as StringUtils from './string/string.utils';
import * as ValidationUtils from './validations/validation.utils';
import * as CnUtils from './classnames/cn.utils';
/**
 * Utils Index
 * Central export for all utility functions
 */

// Array utilities
export * as ArrayUtils from './array/array.utils';
export {
    unique,
    uniqueBy,
    groupBy,
    sortBy,
    chunk,
    sample,
    sampleSize,
    shuffle,
    isEmpty as isArrayEmpty,
    first,
    last,
    removeAt,
    remove,
    move,
    intersection,
    difference,
    flatten,
    range,
    sum,
    average,
    min,
    max,
    partition,
    countBy,
    compact,
} from './array/array.utils';

// Date utilities
export * as DateUtils from './date/date.utils';
export {
    formatDate,
    formatTime,
    formatDateTime,
    getRelativeTime,
    isToday,
    isYesterday,
    isTomorrow,
    isSameDay,
    isPast,
    isFuture,
    addDays,
    addMonths,
    addYears,
    startOfDay,
    endOfDay,
    startOfMonth,
    endOfMonth,
    diffInDays,
    diffInHours,
    diffInMinutes,
    getAge,
    parseDate,
    isValidDate,
    getDaysInMonth,
    getWeekNumber,
    toISODate,
    toISODateTime,
} from './date/date.utils';

// Format utilities
export * as FormatUtils from './date/format.utils';
export {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatPhone,
    formatFileSize,
    getFileIcon,
    formatDuration,
    truncate,
    truncateWords,
    formatName,
    getInitials,
    maskString,
    formatNIK,
    formatMedicalRecordNumber,
    formatAddress,
    formatTimeRange,
    formatList,
    formatCompactNumber,
    formatOrdinal,
    stripHtml,
} from './date/format.utils';

// Object utilities
export * as ObjectUtils from './object/object.utils';
export {
    deepClone,
    deepMerge,
    pick,
    omit,
    isEmpty as isObjectEmpty,
    get,
    set,
    has,
    compact as compactObject,
    compactDeep,
    flatten as flattenObject,
    unflatten,
    keys as objectKeys,
    values as objectValues,
    mapKeys,
    mapValues,
    invert,
    isEqual,
    diff,
    toQueryString,
    fromQueryString,
    groupBy as groupByObject,
} from './object/object.utils';

// Storage utilities
export * as StorageUtils from './storage/storage.utils';
export {
    setItem,
    getItem,
    removeItem,
    clear,
    keys as storageKeys,
    hasItem,
    getSize,
    setItemWithExpiry,
    getItemWithExpiry,
    setLocal,
    getLocal,
    removeLocal,
    setSession,
    getSession,
    removeSession,
    subscribe,
    backup,
    restore,
    removeByPrefix,
    getAll,
    merge as mergeStorage,
} from './storage/storage.utils';

// String utilities
export * as StringUtils from './string/string.utils';
export {
    toCamelCase,
    toPascalCase,
    toSnakeCase,
    toKebabCase,
    toTitleCase,
    capitalize,
    capitalizeWords,
    truncate as truncateString,
    truncateWords as truncateStringWords,
    clean,
    isEmpty as isStringEmpty,
    isNotEmpty,
    pad,
    padStart,
    padEnd,
    removePrefix,
    removeSuffix,
    repeat,
    reverse,
    countOccurrences,
    replaceAll,
    random,
    randomAlphaNumeric,
    randomNumeric,
    slugify,
    extractNumbers,
    extractLetters,
    includes,
    startsWith,
    endsWith,
    escapeHtml,
    unescapeHtml,
    toBoolean,
    isEmail,
    isUrl,
    isNumeric,
    isAlpha,
    isAlphaNumeric,
    mask,
    maskEmail,
    maskPhone,
    wordCount,
    charCount,
    lineCount,
    wrap,
    equals,
    getInitials as getStringInitials,
} from './string/string.utils';

// Validation utilities
export * as ValidationUtils from './validations/validation.utils';
export {
    isEmpty as isValidationEmpty,
    isValidEmail,
    isValidPhone,
    isValidUrl,
    isValidNIK,
    isStrongPassword,
    getPasswordStrength,
    isValidDate as isValidDateString,
    isValidTime,
    isValidAge,
    isValidUsername,
    isValidFileSize,
    isValidFileType,
    isValidImage,
    isInRange,
    isPositive,
    isNegative,
    isInteger,
    hasMinLength,
    hasMaxLength,
    hasRequiredFields,
    isValidGender,
    isValidMedicalRecordNumber,
    isValidTimeSlot,
    isFutureDate,
    isPastDate,
    isValidDateRange,
    sanitizeHtml,
    isValidJson,
    isValidHexColor,
    isValidIPv4,
    createValidator,
} from './validations/validation.utils';

// cn utilities
export * from './classnames/cn.utils';
export { cn } from './classnames/cn.utils';

// Re-export all utilities for convenience
export default {
    Array: ArrayUtils,
    Date: DateUtils,
    Format: FormatUtils,
    Object: ObjectUtils,
    Storage: StorageUtils,
    String: StringUtils,
    Validation: ValidationUtils,
    Cn: CnUtils,
};