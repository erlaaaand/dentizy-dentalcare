export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Login berhasil',
  LOGOUT_SUCCESS: 'Logout berhasil',
  PASSWORD_CHANGED: 'Password berhasil diubah',
  ACTIVATION_SUCCESS: 'Akun berhasil diaktifkan',
  OTP_SENT: 'Kode OTP telah dikirim ke email Anda',

  // CRUD Operations
  CREATE_SUCCESS: 'Data berhasil dibuat',
  UPDATE_SUCCESS: 'Data berhasil diperbarui',
  DELETE_SUCCESS: 'Data berhasil dihapus',
  RESTORE_SUCCESS: 'Data berhasil dipulihkan',

  // Appointments
  APPOINTMENT_CREATED: 'Janji temu berhasil dibuat',
  APPOINTMENT_UPDATED: 'Janji temu berhasil diperbarui',
  APPOINTMENT_COMPLETED: 'Janji temu selesai',
  APPOINTMENT_CANCELLED: 'Janji temu dibatalkan',

  // Patients
  PATIENT_CREATED: 'Pasien berhasil didaftarkan',
  PATIENT_UPDATED: 'Data pasien berhasil diperbarui',

  // Payments
  PAYMENT_PROCESSED: 'Pembayaran berhasil diproses',
  PAYMENT_CANCELLED: 'Pembayaran telah dibatalkan',

  // Medical Records
  MEDICAL_RECORD_CREATED: 'Rekam medis berhasil dibuat',
  MEDICAL_RECORD_UPDATED: 'Rekam medis berhasil diperbarui',

  // Generic
  SAVE_SUCCESS: 'Berhasil disimpan',
  SEND_SUCCESS: 'Berhasil dikirim',
} as const;