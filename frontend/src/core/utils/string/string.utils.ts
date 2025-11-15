/**
 * String Utility Functions
 * Provides helper functions for string manipulation
 */

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
    const camelCase = toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
    return str
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '')
        .replace(/[^a-zA-Z0-9]+/g, '_');
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
    return str
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
        .replace(/[^a-zA-Z0-9]+/g, '-');
}

/**
 * Convert string to Title Case
 */
export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize all words
 */
export function capitalizeWords(str: string): string {
    return str
        .split(' ')
        .map((word) => capitalize(word))
        .join(' ');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number, suffix = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Truncate string by words
 */
export function truncateWords(str: string, wordCount: number, suffix = '...'): string {
    const words = str.split(' ');
    if (words.length <= wordCount) return str;
    return words.slice(0, wordCount).join(' ') + suffix;
}

/**
 * Remove extra whitespace
 */
export function clean(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
}

/**
 * Check if string is not empty
 */
export function isNotEmpty(str: string | null | undefined): boolean {
    return !isEmpty(str);
}

/**
 * Pad string to length
 */
export function pad(
    str: string,
    length: number,
    char = ' ',
    position: 'start' | 'end' = 'end'
): string {
    if (str.length >= length) return str;

    const padding = char.repeat(length - str.length);
    return position === 'start' ? padding + str : str + padding;
}

/**
 * Pad start
 */
export function padStart(str: string, length: number, char = ' '): string {
    return pad(str, length, char, 'start');
}

/**
 * Pad end
 */
export function padEnd(str: string, length: number, char = ' '): string {
    return pad(str, length, char, 'end');
}

/**
 * Remove prefix from string
 */
export function removePrefix(str: string, prefix: string): string {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length);
    }
    return str;
}

/**
 * Remove suffix from string
 */
export function removeSuffix(str: string, suffix: string): string {
    if (str.endsWith(suffix)) {
        return str.slice(0, -suffix.length);
    }
    return str;
}

/**
 * Repeat string n times
 */
export function repeat(str: string, count: number): string {
    return str.repeat(Math.max(0, count));
}

/**
 * Reverse string
 */
export function reverse(str: string): string {
    return str.split('').reverse().join('');
}

/**
 * Count occurrences of substring
 */
export function countOccurrences(str: string, search: string): number {
    if (search.length === 0) return 0;

    let count = 0;
    let position = 0;

    while ((position = str.indexOf(search, position)) !== -1) {
        count++;
        position += search.length;
    }

    return count;
}

/**
 * Replace all occurrences
 */
export function replaceAll(
    str: string,
    search: string,
    replacement: string
): string {
    return str.split(search).join(replacement);
}

/**
 * Generate random string
 */
export function random(length = 10, chars?: string): string {
    const characters =
        chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

/**
 * Generate random alphanumeric string
 */
export function randomAlphaNumeric(length = 10): string {
    return random(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}

/**
 * Generate random numeric string
 */
export function randomNumeric(length = 10): string {
    return random(length, '0123456789');
}

/**
 * Generate slug from string
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Extract numbers from string
 */
export function extractNumbers(str: string): string {
    return str.replace(/\D/g, '');
}

/**
 * Extract letters from string
 */
export function extractLetters(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '');
}

/**
 * Check if string contains substring (case insensitive)
 */
export function includes(str: string, search: string): boolean {
    return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Check if string starts with substring (case insensitive)
 */
export function startsWith(str: string, search: string): boolean {
    return str.toLowerCase().startsWith(search.toLowerCase());
}

/**
 * Check if string ends with substring (case insensitive)
 */
export function endsWith(str: string, search: string): boolean {
    return str.toLowerCase().endsWith(search.toLowerCase());
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };

    return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
    const map: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
    };

    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (entity) => map[entity]);
}

/**
 * Convert string to boolean
 */
export function toBoolean(str: string): boolean {
    const truthy = ['true', '1', 'yes', 'y', 'on'];
    return truthy.includes(str.toLowerCase());
}

/**
 * Check if string is valid email
 */
export function isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
}

/**
 * Check if string is valid URL
 */
export function isUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if string is numeric
 */
export function isNumeric(str: string): boolean {
    return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

/**
 * Check if string is alpha (letters only)
 */
export function isAlpha(str: string): boolean {
    return /^[a-zA-Z]+$/.test(str);
}

/**
 * Check if string is alphanumeric
 */
export function isAlphaNumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Mask string (hide characters)
 */
export function mask(
    str: string,
    visibleStart = 4,
    visibleEnd = 4,
    maskChar = '*'
): string {
    if (str.length <= visibleStart + visibleEnd) return str;

    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);

    return start + masked + end;
}

/**
 * Mask email address
 */
export function maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;

    const maskedUsername =
        username.length > 2
            ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
            : username;

    return `${maskedUsername}@${domain}`;
}

/**
 * Mask phone number
 */
export function maskPhone(phone: string): string {
    const cleaned = extractNumbers(phone);
    if (cleaned.length < 4) return phone;

    return mask(cleaned, 2, 2);
}

/**
 * Word count
 */
export function wordCount(str: string): number {
    return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Character count (excluding spaces)
 */
export function charCount(str: string, includeSpaces = false): number {
    return includeSpaces ? str.length : str.replace(/\s/g, '').length;
}

/**
 * Line count
 */
export function lineCount(str: string): number {
    return str.split('\n').length;
}

/**
 * Wrap text to width
 */
export function wrap(str: string, width: number): string {
    const words = str.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
        if ((currentLine + word).length > width) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });

    if (currentLine) lines.push(currentLine.trim());

    return lines.join('\n');
}

/**
 * Compare strings (case insensitive)
 */
export function equals(str1: string, str2: string): boolean {
    return str1.toLowerCase() === str2.toLowerCase();
}

/**
 * Generate initials from name
 */
export function getInitials(name: string, maxLength = 2): string {
    return name
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, maxLength);
}