/**
 * Gender Options
 */
export const GENDER = {
    MALE: 'L',
    FEMALE: 'P'
} as const;

export const GENDER_LABELS = {
    [GENDER.MALE]: 'Laki-laki',
    [GENDER.FEMALE]: 'Perempuan'
} as const;