import type { MedicalRecordTreatment } from '../../../../types/medical-record-treatments/medical-record-treatments.types';

export class MedicalRecordTreatmentHelper {
  /**
   * Menghitung total biaya dari daftar treatment (subtotal - diskon)
   */
  calculateTotalCost(treatments: MedicalRecordTreatment[]): number {
    return treatments.reduce((total, treatment) => {
      return total + this.calculateFinalPrice(
        treatment.hargaSatuan, 
        treatment.jumlah, 
        treatment.diskon
      );
    }, 0);
  }

  /**
   * Menghitung subtotal sebelum diskon
   */
  calculateSubtotal(harga: number, jumlah: number): number {
    return harga * jumlah;
  }

  /**
   * Menghitung nilai nominal diskon
   */
  calculateDiscountAmount(harga: number, jumlah: number, diskonPersen: number): number {
    const subtotal = this.calculateSubtotal(harga, jumlah);
    return subtotal * (diskonPersen / 100);
  }

  /**
   * Menghitung harga akhir setelah dikurangi diskon
   */
  calculateFinalPrice(harga: number, jumlah: number, diskonPersen: number): number {
    const subtotal = this.calculateSubtotal(harga, jumlah);
    const discount = this.calculateDiscountAmount(harga, jumlah, diskonPersen);
    return subtotal - discount;
  }

  /**
   * Format angka ke Rupiah (IDR)
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export const medicalRecordTreatmentHelper = new MedicalRecordTreatmentHelper();