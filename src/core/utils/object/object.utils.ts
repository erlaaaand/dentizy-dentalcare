/**
 * Object Utility Functions
 * Provides helper functions for object manipulation
 */

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (Array.isArray(obj)) {
        return obj.map((item) => deepClone(item)) as unknown as T;
    }

    const clonedObj: Record<string, unknown> = {};

    for (const key in obj as Record<string, unknown>) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = (obj as Record<string, unknown>)[key];
            clonedObj[key] = deepClone(value);
        }
    }

    return clonedObj as T;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(...objects: Partial<T>[]): T {
    const result = {} as T;

    for (const obj of objects) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];

                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {
                    result[key] = deepMerge(
                        (result[key] as Record<string, unknown>) || {},
                        value as Record<string, unknown>
                    ) as T[typeof key];
                } else {
                    result[key] = value as T[typeof key];
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
export function isEmpty(obj: unknown): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
    return Object.keys(obj).length === 0;
}

/**
 * Get nested property value safely
 */
export function get<T = unknown>(
    obj: Record<string, unknown> | null | undefined,
    path: string,
    defaultValue?: T
): T | undefined {
    const keys = path.split('.');
    let result: unknown = obj;

    for (const key of keys) {
        if (result == null || typeof result !== 'object') return defaultValue;
        result = (result as Record<string, unknown>)[key];
    }

    return (result !== undefined ? (result as T) : defaultValue);
}

/**
 * Set nested property value
 */
export function set<T extends object>(
    obj: T,
    path: string,
    value: unknown
): T {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    let current: Record<string, unknown> = obj as Record<string, unknown>;

    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
            current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
    return obj;
}

/**
 * Check if object has nested property
 */
export function has(obj: unknown, path: string): boolean {
    const keys = path.split('.');
    let current : Record<string, unknown> = obj as Record<string, unknown>;

    for (const key of keys) {
        if (current == null || !(key in current)) {
            return false;
        }
        current = current[key] as Record<string, unknown>;
    }

    return true;
}

/**
 * Remove undefined/null values from object
 */
export function compact<T extends object>(obj: T): Partial<T> {
    const result: Partial<T> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
    const result: Partial<T> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            if (value) {
                if (typeof value === "object" && !Array.isArray(value)) {
                    (result as Record<string, unknown>)[key] = compactDeep(
                        value as Record<string, unknown>
                    );
                } else {
                    (result as Record<string, unknown>)[key] = value;
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
    obj: Record<string, unknown>,
    prefix = '',
    result: Record<string, unknown> = {}
): Record<string, unknown> {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                flatten(value as Record<string, unknown>, newKey, result);
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
export function unflatten(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            set(result, key, obj[key]);
        }
    }

    return result;
}

/**
 * Get all keys from nested object
 */
export function keys(obj: Record<string, unknown>, prefix = ""): string[] {
    const result: string[] = [];

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            result.push(newKey);

            const value = obj[key];
            if (value && typeof value === "object" && !Array.isArray(value)) {
                result.push(...keys(value as Record<string, unknown>, newKey));
            }
        }
    }

    return result;
}

/**
 * Get all values from nested object
 */
export function values(obj: Record<string, unknown>): unknown[] {
    const result: unknown[] = [];

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            if (value && typeof value === "object" && !Array.isArray(value)) {
                result.push(...values(value as Record<string, unknown>));
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
    fn: (key: string, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
    const result: Record<string, T[keyof T]> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
    fn: (value: T[keyof T], key: keyof T) => R
): { [K in keyof T]: R } {
    const result = {} as { [K in keyof T]: R };

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
export function isEqual(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

    const obj1Record = obj1 as Record<string, unknown>;
    const obj2Record = obj2 as Record<string, unknown>;

    const keys1 = Object.keys(obj1Record);
    const keys2 = Object.keys(obj2Record);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!isEqual(obj1Record[key], obj2Record[key])) return false;
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
    const result: Partial<T> = {};

    for (const key in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, key)) {
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
export function toQueryString(obj: Record<string, unknown>): string {
    const params = new URLSearchParams();

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null) {
            const value = obj[key];

            if (Array.isArray(value)) {
                value.forEach((v) => params.append(key, String(v)));
            } else {
                params.append(key, String(value));
            }
        }
    }

    return params.toString();
}

/**
 * Parse query string to object
 */
export function fromQueryString(queryString: string): Record<string, unknown> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, unknown> = {};

    params.forEach((value, key) => {
        const existing = result[key];

        if (existing !== undefined) {
            if (Array.isArray(existing)) {
                existing.push(value);
                result[key] = existing;
            } else {
                result[key] = [existing, value];
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