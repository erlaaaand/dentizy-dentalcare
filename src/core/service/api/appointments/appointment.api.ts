/**
 * Appointment API layer.
 *
 * Thin wrapper around the orval-generated controller functions.
 * All public methods use the domain-typed DTOs from the types layer
 * so that the rest of the app never reaches into `api/generated` directly.
 */

import {
  appointmentsControllerFindAll,
  appointmentsControllerFindOne,
  appointmentsControllerCreate,
  appointmentsControllerUpdate,
  appointmentsControllerCancel,
  appointmentsControllerComplete,
  appointmentsControllerRemove,
} from '../../../api/generated/appointments/appointments';

import type {
  AppointmentQueryParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../../../types/appointments/appointment.types';

export const AppointmentApi = {
  // -----------------------------------------------------------------------
  // Queries
  // -----------------------------------------------------------------------

  /**
   * GET /appointments
   * Mengambil daftar appointment dengan pagination & filter.
   */
  findAll: async (params?: AppointmentQueryParams) => {
    return appointmentsControllerFindAll(params);
  },

  /**
   * GET /appointments/:id
   * Mengambil detail satu appointment berdasarkan ID.
   */
  findOne: async (id: string) => {
    return appointmentsControllerFindOne(id);
  },

  // -----------------------------------------------------------------------
  // Mutations
  // -----------------------------------------------------------------------

  /**
   * POST /appointments
   * Membuat appointment baru dengan validasi waktu & conflict detection.
   */
  create: async (data: CreateAppointmentDto) => {
    return appointmentsControllerCreate(data as unknown as Record<string, unknown>);
  },

  /**
   * PATCH /appointments/:id
   * Update data appointment.
   * Jika status SELESAI & ada medical_record, akan memicu transaksi rekam medis.
   */
  update: async (id: string, data: UpdateAppointmentDto) => {
    return appointmentsControllerUpdate(id, data as unknown as Record<string, unknown>);
  },

  /**
   * POST /appointments/:id/cancel
   * Batalkan appointment.
   * Pembatalan < 24 jam hanya diizinkan untuk Kepala Klinik.
   */
  cancel: async (id: string) => {
    return appointmentsControllerCancel(id);
  },

  /**
   * POST /appointments/:id/complete
   * Ubah status appointment menjadi SELESAI.
   */
  complete: async (id: string) => {
    return appointmentsControllerComplete(id);
  },

  /**
   * DELETE /appointments/:id
   * Hapus appointment (hanya jika belum ada medical record).
   */
  remove: async (id: string) => {
    return appointmentsControllerRemove(id);
  },
};