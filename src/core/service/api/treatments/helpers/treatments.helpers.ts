import type { Treatment } from '../../../../types/treatments/treatment.types';

/**
 * Treatments Helper Functions
 * Utility functions for treatments
 */
export class TreatmentsHelpers {
  /**
   * Format treatment code
   */
  formatKode(kode: string): string {
    return kode.toUpperCase().trim();
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Check if treatment is active
   */
  isActive(treatment: Treatment): boolean {
    return treatment.isActive && !treatment.deletedAt;
  }

  /**
   * Check if treatment can be deleted
   */
  canDelete(treatment: Treatment): boolean {
    return !treatment.deletedAt;
  }

  /**
   * Check if treatment can be restored
   */
  canRestore(treatment: Treatment): boolean {
    return !!treatment.deletedAt;
  }

  /**
   * Check if treatment can be activated/deactivated
   */
  canToggleStatus(treatment: Treatment): boolean {
    return !treatment.deletedAt;
  }

  /**
   * Get status label
   */
  getStatusLabel(treatment: Treatment): string {
    if (treatment.deletedAt) return 'Dihapus';
    if (!treatment.isActive) return 'Nonaktif';
    return 'Aktif';
  }

  /**
   * Get status color
   */
  getStatusColor(treatment: Treatment): string {
    if (treatment.deletedAt) return 'gray';
    if (!treatment.isActive) return 'red';
    return 'green';
  }

  /**
   * Format discount percentage
   */
  formatDiscount(diskon: number): string {
    return `${diskon}%`;
  }

  /**
   * Sort treatments by name
   */
  sortByName(treatments: Treatment[], order: 'asc' | 'desc' = 'asc'): Treatment[] {
    return [...treatments].sort((a, b) => {
      const comparison = a.namaPerawatan.localeCompare(b.namaPerawatan, 'id');
      return order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Sort treatments by price
   */
  sortByPrice(treatments: Treatment[], order: 'asc' | 'desc' = 'asc'): Treatment[] {
    return [...treatments].sort((a, b) => {
        if (order === 'asc') {
            return a.harga - b.harga;
        } else {
            return b.harga - a.harga;
        }
    })
  }

  /**
   * Filter active treatments
   */
  filterActive(treatments: Treatment[]): Treatment[] {
    return treatments.filter(treatment => this.isActive(treatment));
  }

  /**
   * Filter by category
   */
  filterByCategory(treatments: Treatment[], categoryId: string): Treatment[] {
    return treatments.filter(treatment => treatment.categoryId === categoryId);
  }

  /**
   * Search treatments by name or code
   */
  search(treatments: Treatment[], searchTerm: string): Treatment[] {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      return treatments;
    }
    
    return treatments.filter(treatment =>
      treatment.namaPerawatan.toLowerCase().includes(term) ||
      treatment.kodePerawatan.toLowerCase().includes(term) ||
      (treatment.deskripsi && treatment.deskripsi.toLowerCase().includes(term))
    );
  }
}

export const treatmentsHelpers = new TreatmentsHelpers();