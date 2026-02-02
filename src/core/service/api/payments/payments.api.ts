import {
  paymentsControllerFindAll,
  paymentsControllerFindOne,
  paymentsControllerCreate,
  paymentsControllerUpdate,
  paymentsControllerRemove,
  paymentsControllerProcess,
  paymentsControllerCancel,
} from "@/src/core/api/generated/payments/payments"

import type {
  PaymentResponseDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  ProcessPaymentDto,
  PaymentsControllerFindAllParams
} from "@/src/core/api/model"

const extract = <T>(promise: Promise<unknown>): Promise<T> => {
  return promise.then((res) => (res as { data: T }).data)
}

export const PaymentApi = {
  findAll: (params?: PaymentsControllerFindAllParams) => 
    extract<PaymentResponseDto[]>(paymentsControllerFindAll(params)),

  findOne: (id: number) => 
    extract<PaymentResponseDto>(paymentsControllerFindOne(id)),

  create: (data: CreatePaymentDto) => 
    extract<PaymentResponseDto>(paymentsControllerCreate(data)),

  update: (id: number, data: UpdatePaymentDto) => 
    extract<PaymentResponseDto>(paymentsControllerUpdate(id, data)),

  process: (id: number, data: ProcessPaymentDto) => 
    extract<PaymentResponseDto>(paymentsControllerProcess(id, data)),

  cancel: (id: number) => 
    extract<PaymentResponseDto>(paymentsControllerCancel(id)),

  remove: async (id: number) => {
    await paymentsControllerRemove(id)
  }
}