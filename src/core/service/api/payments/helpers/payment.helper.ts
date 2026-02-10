import type { PaymentStatus, PaymentResponseDto  } from '../../../../types/payments/payments.types';

/**
 * Payments Helper Functions
 * Utility functions for payments
 */
export class PaymentsHelpers {
  /**
   * Format currency to IDR
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      lunas: 'Lunas',
      sebagian: 'Sebagian',
      dibatalkan: 'Dibatalkan'
    };
    return labels[status] || status;
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'yellow',
      lunas: 'green',
      sebagian: 'blue',
      dibatalkan: 'red'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get method label
   */
  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      tunai: 'Tunai',
      transfer: 'Transfer Bank',
      kartu_kredit: 'Kartu Kredit',
      kartu_debit: 'Kartu Debit',
      qris: 'QRIS'
    };
    return labels[method] || method;
  }

  /**
   * Format invoice number
   */
  formatInvoiceNumber(invoice: string): string {
    return invoice.toUpperCase();
  }

  /**
   * Check if payment is overdue
   */
  isOverdue(createdAt: string, daysThreshold: number = 30): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > daysThreshold;
  }

  /**
   * Calculate change
   */
  calculateKembalian(totalBiaya: number, jumlahBayar: number): number {
    return Math.max(0, jumlahBayar - totalBiaya);
  }

  /**
   * Get payment status
   */
  getPaymentStatus(payment: PaymentResponseDto): PaymentStatus {
    const isPending = payment.statusPembayaran === 'pending';
    const isCompleted = payment.statusPembayaran === 'lunas';
    const isPartial = payment.statusPembayaran === 'sebagian';
    const isCancelled = payment.statusPembayaran === 'dibatalkan';

    return {
      isPending,
      isCompleted,
      isPartial,
      isCancelled,
      canEdit: !isCompleted && !isCancelled,
      canDelete: isPending,
      canProcess: isPending || isPartial,
      canRefund: isCompleted
    };
  }

  /**
   * Check if payment can be edited
   */
  canEdit(payment: PaymentResponseDto): boolean {
    const status = this.getPaymentStatus(payment);
    return status.canEdit;
  }

  /**
   * Check if payment can be deleted
   */
  canDelete(payment: PaymentResponseDto): boolean {
    const status = this.getPaymentStatus(payment);
    return status.canDelete;
  }

  /**
   * Check if payment can be processed
   */
  canProcess(payment: PaymentResponseDto): boolean {
    const status = this.getPaymentStatus(payment);
    return status.canProcess;
  }

  /**
   * Check if payment can be refunded
   */
  canRefund(payment: PaymentResponseDto): boolean {
    const status = this.getPaymentStatus(payment);
    return status.canRefund;
  }
}

export const paymentsHelpers = new PaymentsHelpers();