'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { useMedicalRecordTreatmentManager } from '@/src/core/hooks/medical-record-treatments/combined';
import { medicalRecordTreatmentHelper } from '@/src/core/service/api/medical-record-treatments/helpers/treatment.helper';
import type {
  CreateMedicalRecordTreatmentDto,
  MedicalRecordTreatment,
} from '@/src/core/types/medical-record-treatments/medical-record-treatments.types';

// ==================== DRAFT TYPES ====================

/**
 * Item tindakan yang sedang diinput sebelum disimpan ke database.
 * Memiliki `draftId` sebagai identifier lokal sementara.
 */
export interface DraftTreatmentItem {
  draftId: string;
  treatmentId: string;
  namaPerawatan: string;
  hargaSatuan: number;
  jumlah: number;
  diskon: number;
  /** Nilai kalkulasi lokal, selalu up-to-date saat item berubah */
  finalPrice: number;
}

// ==================== STATE & ACTION ====================

interface DraftState {
  items: DraftTreatmentItem[];
}

type DraftAction =
  | { type: 'ADD_ITEM'; payload: Omit<DraftTreatmentItem, 'draftId' | 'finalPrice'> }
  | { type: 'UPDATE_ITEM'; draftId: string; payload: Partial<Omit<DraftTreatmentItem, 'draftId'>> }
  | { type: 'REMOVE_ITEM'; draftId: string }
  | { type: 'CLEAR_DRAFT' };

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const finalPrice = medicalRecordTreatmentHelper.calculateFinalPrice(
        action.payload.hargaSatuan,
        action.payload.jumlah,
        action.payload.diskon
      );
      const newItem: DraftTreatmentItem = {
        ...action.payload,
        draftId: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        finalPrice,
      };
      return { items: [...state.items, newItem] };
    }

    case 'UPDATE_ITEM': {
      return {
        items: state.items.map((item) => {
          if (item.draftId !== action.draftId) return item;
          const updated = { ...item, ...action.payload };
          updated.finalPrice = medicalRecordTreatmentHelper.calculateFinalPrice(
            updated.hargaSatuan,
            updated.jumlah,
            updated.diskon
          );
          return updated;
        }),
      };
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.draftId !== action.draftId) };

    case 'CLEAR_DRAFT':
      return { items: [] };

    default:
      return state;
  }
}

// ==================== CONTEXT TYPE ====================

interface MedicalRecordTreatmentContextType {
  // ---------- Data dari server ----------
  /** Daftar tindakan yang sudah tersimpan di DB */
  savedTreatments: MedicalRecordTreatment[];
  /** Total biaya (diambil dari server) */
  savedTotal: number;
  isLoadingTreatments: boolean;
  isLoadingTotal: boolean;
  refetchAll: () => Promise<void>;

  // ---------- Draft (belum disimpan) ----------
  draftItems: DraftTreatmentItem[];
  addDraftItem: (item: Omit<DraftTreatmentItem, 'draftId' | 'finalPrice'>) => void;
  updateDraftItem: (draftId: string, payload: Partial<Omit<DraftTreatmentItem, 'draftId'>>) => void;
  removeDraftItem: (draftId: string) => void;
  clearDraft: () => void;

  // ---------- Kalkulasi lokal draft ----------
  draftSubtotal: number;
  draftTotalDiscount: number;
  draftGrandTotal: number;
  formattedDraftGrandTotal: string;

  // ---------- Mutations ----------
  createTreatmentAsync: (data: CreateMedicalRecordTreatmentDto) => Promise<MedicalRecordTreatment>;
  isCreating: boolean;
  createError: Error | null;

  // ---------- ID rekam medis aktif ----------
  medicalRecordId: string;
}

// ==================== CONTEXT ====================

const MedicalRecordTreatmentContext = createContext<
  MedicalRecordTreatmentContextType | undefined
>(undefined);

// ==================== PROVIDER ====================

interface MedicalRecordTreatmentProviderProps {
  children: ReactNode;
  /** ID rekam medis yang sedang aktif dibuka */
  medicalRecordId: string;
}

export function MedicalRecordTreatmentProvider({
  children,
  medicalRecordId,
}: MedicalRecordTreatmentProviderProps) {
  const [draftState, dispatch] = useReducer(draftReducer, { items: [] });

  const manager = useMedicalRecordTreatmentManager(medicalRecordId);

  // ---------- Draft actions ----------
  const addDraftItem = useCallback(
    (item: Omit<DraftTreatmentItem, 'draftId' | 'finalPrice'>) => {
      dispatch({ type: 'ADD_ITEM', payload: item });
    },
    []
  );

  const updateDraftItem = useCallback(
    (draftId: string, payload: Partial<Omit<DraftTreatmentItem, 'draftId'>>) => {
      dispatch({ type: 'UPDATE_ITEM', draftId, payload });
    },
    []
  );

  const removeDraftItem = useCallback((draftId: string) => {
    dispatch({ type: 'REMOVE_ITEM', draftId });
  }, []);

  const clearDraft = useCallback(() => {
    dispatch({ type: 'CLEAR_DRAFT' });
  }, []);

  // ---------- Kalkulasi lokal ----------
  const draftSubtotal = useMemo(
    () =>
      draftState.items.reduce(
        (sum, item) =>
          sum +
          medicalRecordTreatmentHelper.calculateSubtotal(item.hargaSatuan, item.jumlah),
        0
      ),
    [draftState.items]
  );

  const draftTotalDiscount = useMemo(
    () =>
      draftState.items.reduce(
        (sum, item) =>
          sum +
          medicalRecordTreatmentHelper.calculateDiscountAmount(
            item.hargaSatuan,
            item.jumlah,
            item.diskon
          ),
        0
      ),
    [draftState.items]
  );

  const draftGrandTotal = useMemo(
    () => draftSubtotal - draftTotalDiscount,
    [draftSubtotal, draftTotalDiscount]
  );

  const formattedDraftGrandTotal = useMemo(
    () => medicalRecordTreatmentHelper.formatCurrency(draftGrandTotal),
    [draftGrandTotal]
  );

  const value = useMemo<MedicalRecordTreatmentContextType>(
    () => ({
      // Server data
      savedTreatments: manager.treatments,
      savedTotal: manager.total,
      isLoadingTreatments: manager.isLoadingTreatments,
      isLoadingTotal: manager.isLoadingTotal,
      refetchAll: manager.refetchAll,

      // Draft
      draftItems: draftState.items,
      addDraftItem,
      updateDraftItem,
      removeDraftItem,
      clearDraft,

      // Kalkulasi
      draftSubtotal,
      draftTotalDiscount,
      draftGrandTotal,
      formattedDraftGrandTotal,

      // Mutations
      createTreatmentAsync: manager.createTreatmentAsync,
      isCreating: manager.isCreating,
      createError: manager.createError,

      medicalRecordId,
    }),
    [
      manager,
      draftState.items,
      addDraftItem,
      updateDraftItem,
      removeDraftItem,
      clearDraft,
      draftSubtotal,
      draftTotalDiscount,
      draftGrandTotal,
      formattedDraftGrandTotal,
      medicalRecordId,
    ]
  );

  return (
    <MedicalRecordTreatmentContext.Provider value={value}>
      {children}
    </MedicalRecordTreatmentContext.Provider>
  );
}

// ==================== HOOK ====================

export function useMedicalRecordTreatmentContext(): MedicalRecordTreatmentContextType {
  const ctx = useContext(MedicalRecordTreatmentContext);
  if (!ctx) {
    throw new Error(
      'useMedicalRecordTreatmentContext harus digunakan di dalam MedicalRecordTreatmentProvider'
    );
  }
  return ctx;
}