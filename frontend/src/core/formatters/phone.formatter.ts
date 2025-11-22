/**
 * Format phone number to Indonesian format
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('62')) {
    // +62 format
    const number = cleaned.substring(2);
    if (number.length >= 10) {
      return `+62 ${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
    }
    return `+62 ${number}`;
  } else if (cleaned.startsWith('0')) {
    // 0 format
    const number = cleaned.substring(1);
    if (number.length >= 10) {
      return `0${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
    }
    return cleaned;
  }

  return phone;
}

/**
 * Convert phone to international format (+62)
 */
export function toInternationalPhone(phone: string | null | undefined): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+62${cleaned.substring(1)}`;
  }

  return `+62${cleaned}`;
}

/**
 * Convert phone to local format (0)
 */
export function toLocalPhone(phone: string | null | undefined): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('62')) {
    return `0${cleaned.substring(2)}`;
  } else if (cleaned.startsWith('0')) {
    return cleaned;
  }

  return `0${cleaned}`;
}

/**
 * Validate Indonesian phone number
 */
export function validatePhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return false;

  const cleaned = phone.replace(/\D/g, '');

  // Check if starts with 62 or 0
  if (!cleaned.startsWith('62') && !cleaned.startsWith('0')) {
    return false;
  }

  // Check length (Indonesian phone numbers are typically 10-13 digits)
  const numberPart = cleaned.startsWith('62')
    ? cleaned.substring(2)
    : cleaned.substring(1);

  return numberPart.length >= 9 && numberPart.length <= 12;
}

/**
 * Format phone for WhatsApp link
 */
export function formatPhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('62')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return `62${cleaned.substring(1)}`;
  }

  return `62${cleaned}`;
}

/**
 * Get WhatsApp link
 */
export function getWhatsAppLink(phone: string | null | undefined, message?: string): string {
  if (!phone) return '';

  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = message ? encodeURIComponent(message) : '';

  return `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Mask phone number for privacy
 */
export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 4) return phone;

  const visible = cleaned.substring(0, 4);
  const masked = '*'.repeat(cleaned.length - 4);

  return formatPhoneNumber(`${visible}${masked}`);
}