/**
 * Array Utility Functions
 * Provides helper functions for array manipulation
 */

/**
 * Remove duplicate items from array
 */
export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

/**
 * Remove duplicate objects by key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter((item) => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

/**
 * Group array items by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(
    array: T[],
    key: keyof T,
    order: 'asc' | 'desc' = 'asc'
): T[] {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal === bVal) return 0;

        const comparison = aVal > bVal ? 1 : -1;
        return order === 'asc' ? comparison : -comparison;
    });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Get random item from array
 */
export function sample<T>(array: T[]): T | undefined {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random items from array
 */
export function sampleSize<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(size, array.length));
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(array: T[] | null | undefined): boolean {
    return !array || array.length === 0;
}

/**
 * Get first item
 */
export function first<T>(array: T[]): T | undefined {
    return array[0];
}

/**
 * Get last item
 */
export function last<T>(array: T[]): T | undefined {
    return array[array.length - 1];
}

/**
 * Remove item by index
 */
export function removeAt<T>(array: T[], index: number): T[] {
    return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Remove item by value
 */
export function remove<T>(array: T[], value: T): T[] {
    return array.filter((item) => item !== value);
}

/**
 * Move item from one index to another
 */
export function move<T>(array: T[], from: number, to: number): T[] {
    const result = [...array];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
}

/**
 * Get intersection of two arrays
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
    const set2 = new Set(array2);
    return array1.filter((item) => set2.has(item));
}

/**
 * Get difference of two arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
    const set2 = new Set(array2);
    return array1.filter((item) => !set2.has(item));
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(array: (T | T[])[]): T[] {
    return array.reduce<T[]>((acc, val) => {
        return acc.concat(Array.isArray(val) ? flatten(val) : val);
    }, []);
}

/**
 * Create range of numbers
 */
export function range(start: number, end: number, step = 1): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i += step) {
        result.push(i);
    }
    return result;
}

/**
 * Sum array of numbers
 */
export function sum(array: number[]): number {
    return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Average of array of numbers
 */
export function average(array: number[]): number {
    return isEmpty(array) ? 0 : sum(array) / array.length;
}

/**
 * Get min value
 */
export function min(array: number[]): number | undefined {
    return isEmpty(array) ? undefined : Math.min(...array);
}

/**
 * Get max value
 */
export function max(array: number[]): number | undefined {
    return isEmpty(array) ? undefined : Math.max(...array);
}

/**
 * Partition array based on predicate
 */
export function partition<T>(
    array: T[],
    predicate: (item: T) => boolean
): [T[], T[]] {
    const truthy: T[] = [];
    const falsy: T[] = [];

    array.forEach((item) => {
        if (predicate(item)) {
            truthy.push(item);
        } else {
            falsy.push(item);
        }
    });

    return [truthy, falsy];
}

/**
 * Count occurrences of items
 */
export function countBy<T>(array: T[], key?: keyof T): Record<string, number> {
    return array.reduce((result, item) => {
        const countKey = key ? String(item[key]) : String(item);
        result[countKey] = (result[countKey] || 0) + 1;
        return result;
    }, {} as Record<string, number>);
}

/**
 * Compact array (remove falsy values)
 */
export function compact<T>(array: (T | null | undefined | false | '' | 0)[]): T[] {
    return array.filter(Boolean) as T[];
}