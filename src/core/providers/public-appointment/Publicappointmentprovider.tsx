'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePublicDoctors } from '@/src/core/hooks/public-appointments/queries';
import { usePublicBooking } from '@/src/core/hooks/public-appointments/mutations';
import { publicAppointmentsHelpers } from '@/src/core/service/api/public-appointments/helpers/public-appointments.helpers';
import { publicAppointmentsValidators } from '@/src/core/service/api/public-appointments/validators/public-appointments.validators';
import type {
  PublicBookingFormData,
  DoctorAvailability,
  BookingValidation,
  PublicBookingDtoJenisKelamin,
} from '@/src/core/types/public-appointments/public-appointments.types';

// ==================== STEP DEFINITION ====================

export type BookingStep = 'select-doctor' | 'select-schedule' | 'fill-data' | 'confirmation';

export const BOOKING_STEPS: BookingStep[] = [
  'select-doctor',
  'select-schedule',
  'fill-data',
  'confirmation',
];

export const BOOKING_STEP_LABELS: Record<BookingStep, string> = {
  'select-doctor': 'Pilih Dokter',
  'select-schedule': 'Pilih Jadwal',
  'fill-data': 'Isi Data Diri',
  'confirmation': 'Konfirmasi',
};

// ==================== INITIAL FORM DATA ====================

const INITIAL_FORM_DATA: PublicBookingFormData = {
  nik: '',
  nama_lengkap: '',
  tanggal_lahir: '',
  jenis_kelamin: '' as PublicBookingDtoJenisKelamin,
  no_hp: '',
  email: '',
  tanggal_janji: '',
  jam_janji: '',
  doctor_id: '',
  keluhan: '',
  alamat: '',
  acceptTerms: false,
  acceptPrivacyPolicy: false,
};

// ==================== CONTEXT TYPE ====================

interface PublicAppointmentContextType {
  // ---------- Stepper ----------
  currentStep: BookingStep;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // ---------- Form Data ----------
  formData: PublicBookingFormData;
  updateFormData: (patch: Partial<PublicBookingFormData>) => void;
  resetFormData: () => void;

  // ---------- Selected Doctor ----------
  selectedDoctor: DoctorAvailability | null;
  selectDoctor: (doctor: DoctorAvailability) => void;

  // ---------- Doctors List ----------
  doctors: DoctorAvailability[];
  isLoadingDoctors: boolean;
  isDoctorsError: boolean;

  // ---------- Validation ----------
  validateCurrentStep: () => BookingValidation;
  formattedNIK: string;
  formattedPhone: string;
  patientAge: number | null;

  // ---------- Submission ----------
  submitBooking: () => void;
  submitBookingAsync: () => Promise<void>;
  isSubmitting: boolean;
  submitError: Error | null;
  isSuccess: boolean;
  resetSubmission: () => void;
}

// ==================== CONTEXT ====================

const PublicAppointmentContext = createContext<
  PublicAppointmentContextType | undefined
>(undefined);

// ==================== PROVIDER ====================

export function PublicAppointmentProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('select-doctor');
  const [formData, setFormData] = useState<PublicBookingFormData>(INITIAL_FORM_DATA);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAvailability | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ---------- Doctors query ----------
  const doctorsQuery = usePublicDoctors();
  const doctors = (doctorsQuery.data ?? []) as DoctorAvailability[];

  // ---------- Booking mutation ----------
  const bookingMutation = usePublicBooking();

  // ---------- Stepper ----------
  const currentStepIndex = BOOKING_STEPS.indexOf(currentStep);

  const goToStep = useCallback((step: BookingStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < BOOKING_STEPS.length) {
      setCurrentStep(BOOKING_STEPS[nextIndex]);
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(BOOKING_STEPS[prevIndex]);
    }
  }, [currentStepIndex]);

  // ---------- Form ----------
  const updateFormData = useCallback((patch: Partial<PublicBookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedDoctor(null);
    setCurrentStep('select-doctor');
    setIsSuccess(false);
    bookingMutation.reset();
  }, [bookingMutation]);

  // ---------- Doctor selection ----------
  const selectDoctor = useCallback((doctor: DoctorAvailability) => {
    setSelectedDoctor(doctor);
    setFormData((prev) => ({ ...prev, doctor_id: doctor.doctorId }));
  }, []);

  // ---------- Validation ----------
  const validateCurrentStep = useCallback((): BookingValidation => {
    return publicAppointmentsValidators.validateBooking(formData);
  }, [formData]);

  const formattedNIK = useMemo(
    () => (formData.nik ? publicAppointmentsHelpers.formatNIK(formData.nik) : ''),
    [formData.nik]
  );

  const formattedPhone = useMemo(
    () => (formData.no_hp ? publicAppointmentsHelpers.formatPhoneNumber(formData.no_hp) : ''),
    [formData.no_hp]
  );

  const patientAge = useMemo(
    () =>
      formData.tanggal_lahir
        ? publicAppointmentsHelpers.calculateAge(formData.tanggal_lahir)
        : null,
    [formData.tanggal_lahir]
  );

  // ---------- Submission ----------
  const submitBooking = useCallback(() => {
    bookingMutation.mutate(formData, {
      onSuccess: () => setIsSuccess(true),
    });
  }, [bookingMutation, formData]);

  const submitBookingAsync = useCallback(async () => {
    await bookingMutation.mutateAsync(formData);
    setIsSuccess(true);
  }, [bookingMutation, formData]);

  const resetSubmission = useCallback(() => {
    bookingMutation.reset();
    setIsSuccess(false);
  }, [bookingMutation]);

  const value = useMemo<PublicAppointmentContextType>(
    () => ({
      // Stepper
      currentStep,
      currentStepIndex,
      totalSteps: BOOKING_STEPS.length,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === BOOKING_STEPS.length - 1,
      goToStep,
      nextStep,
      prevStep,

      // Form
      formData,
      updateFormData,
      resetFormData,

      // Doctor
      selectedDoctor,
      selectDoctor,

      // Doctors list
      doctors,
      isLoadingDoctors: doctorsQuery.isLoading,
      isDoctorsError: doctorsQuery.isError,

      // Validation
      validateCurrentStep,
      formattedNIK,
      formattedPhone,
      patientAge,

      // Submission
      submitBooking,
      submitBookingAsync,
      isSubmitting: bookingMutation.isPending,
      submitError: bookingMutation.error,
      isSuccess,
      resetSubmission,
    }),
    [
      currentStep,
      currentStepIndex,
      goToStep,
      nextStep,
      prevStep,
      formData,
      updateFormData,
      resetFormData,
      selectedDoctor,
      selectDoctor,
      doctors,
      doctorsQuery.isLoading,
      doctorsQuery.isError,
      validateCurrentStep,
      formattedNIK,
      formattedPhone,
      patientAge,
      submitBooking,
      submitBookingAsync,
      bookingMutation.isPending,
      bookingMutation.error,
      isSuccess,
      resetSubmission,
    ]
  );

  return (
    <PublicAppointmentContext.Provider value={value}>
      {children}
    </PublicAppointmentContext.Provider>
  );
}

// ==================== HOOK ====================

export function usePublicAppointmentContext(): PublicAppointmentContextType {
  const ctx = useContext(PublicAppointmentContext);
  if (!ctx) {
    throw new Error(
      'usePublicAppointmentContext harus digunakan di dalam PublicAppointmentProvider'
    );
  }
  return ctx;
}