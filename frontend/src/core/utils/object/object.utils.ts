/**
 * Object Utility Functions
 * Provides helper functions for object manipulation
 */

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;

    const clonedObj = {} as T;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(...objects: Partial<T>[]): T {
    const result = {} as T;

    for (const obj of objects) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];

                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    result[key] = deepMerge(
                        (result[key] as any) || {},
                        value as any
                    ) as any;
                } else {
                    result[key] = value as any;
                }
            }
        }
    }

    return result;
}

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;

    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });

    return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };

    keys.forEach((key) => {
        delete result[key];
    });

    return result;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
    return Object.keys(obj).length === 0;
}

/**
 * Get nested property value safely
 */
export function get<T = any>(
    obj: any,
    path: string,
    defaultValue?: T
): T | undefined {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result == null) return defaultValue;
        result = result[key];
    }

    return result !== undefined ? result : defaultValue;
}

/**
 * Set nested property value
 */
export function set<T extends object>(
    obj: T,
    path: string,
    value: any
): T {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current: any = obj;

    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }

    current[lastKey] = value;
    return obj;
}

/**
 * Check if object has nested property
 */
export function has(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current == null || !(key in current)) {
            return false;
        }
        current = current[key];
    }

    return true;
}

/**
 * Remove undefined/null values from object
 */
export function compact<T extends object>(obj: T): Partial<T> {
    const result: any = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value !== undefined && value !== null) {
                result[key] = value;
            }
        }
    }

    return result;
}

/**
 * Remove falsy values from object
 */
export function compactDeep<T extends object>(obj: T): Partial<T> {
    const result: any = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (value) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    result[key] = compactDeep(value);
                } else {
                    result[key] = value;
                }
            }
        }
    }

    return result;
}

/**
 * Flatten nested object
 */
export function flatten(
    obj: any,
    prefix = '',
    result: Record<string, any> = {}
): Record<string, any> {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                flatten(value, newKey, result);
            } else {
                result[newKey] = value;
            }
        }
    }

    return result;
}

/**
 * Unflatten object
 */
export function unflatten(obj: Record<string, any>): any {
    const result: any = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            set(result, key, obj[key]);
        }
    }

    return result;
}

/**
 * Get all keys from nested object
 */
export function keys(obj: any, prefix = ''): string[] {
    const result: string[] = [];

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            result.push(newKey);

            const value = obj[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result.push(...keys(value, newKey));
            }
        }
    }

    return result;
}

/**
 * Get all values from nested object
 */
export function values(obj: any): any[] {
    const result: any[] = [];

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result.push(...values(value));
            } else {
                result.push(value);
            }
        }
    }

    return result;
}

/**
 * Transform object keys
 */
export function mapKeys<T extends object>(
    obj: T,
    fn: (key: string, value: any) => string
): any {
    const result: any = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = fn(key, obj[key]);
            result[newKey] = obj[key];
        }
    }

    return result;
}

/**
 * Transform object values
 */
export function mapValues<T extends object, R>(
    obj: T,
    fn: (value: any, key: string) => R
): Record<keyof T, R> {
    const result: any = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = fn(obj[key], key);
        }
    }

    return result;
}

/**
 * Invert object keys and values
 */
export function invert(obj: Record<string, string | number>): Record<string, string> {
    const result: Record<string, string> = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[String(obj[key])] = key;
        }
    }

    return result;
}

/**
 * Check deep equality of two objects
 */
export function isEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!isEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}

/**
 * Get difference between two objects
 */
export function diff<T extends object>(
    obj1: T,
    obj2: T
): Partial<T> {
    const result: any = {};

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (!isEqual(obj1[key], obj2[key])) {
                result[key] = obj2[key];
            }
        }
    }

    return result;
}

/**
 * Convert object to query string
 */
export function toQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] != null) {
            if (Array.isArray(obj[key])) {
                obj[key].forEach((value: any) => params.append(key, String(value)));
            } else {
                params.append(key, String(obj[key]));
            }
        }
    }

    return params.toString();
}

/**
 * Parse query string to object
 */
export function fromQueryString(queryString: string): Record<string, any> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, any> = {};

    params.forEach((value, key) => {
        if (result[key]) {
            if (Array.isArray(result[key])) {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        } else {
            result[key] = value;
        }
    });

    return result;
}

/**
 * Group object by key value
 */
export function groupBy<T>(
    array: T[],
    key: keyof T | ((item: T) => string)
): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = typeof key === 'function' ? key(item) : String(item[key]);

        if (!result[groupKey]) {
            result[groupKey] = [];
        }

        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}