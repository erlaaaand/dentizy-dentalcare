export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
}

export function formatTime(timeString: string): string {
  try {
    // Cukup ambil 5 karakter pertama (HH:MM)
    if (timeString && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    return timeString;
  } catch {
    return timeString;
  }
}