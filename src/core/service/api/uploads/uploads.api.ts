import {
  uploadsControllerUploadFile,
  type uploadsControllerUploadFileResponse,
} from "@/src/core/api/generated/uploads/uploads"

// --- RESPONSE WRAPPERS ---
export interface UploadFileResponse {
  data?: unknown
  status?: number
  headers?: Headers
}

export const UploadsApi = {
  /**
   * Upload file foto profil
   */
  uploadFile: async (options?: RequestInit): Promise<UploadFileResponse> => {
    const response = await uploadsControllerUploadFile(options)

    const typedResponse = response as unknown as UploadFileResponse | uploadsControllerUploadFileResponse

    if ("data" in typedResponse || "status" in typedResponse) {
      return {
        data: typedResponse.data,
        status: typedResponse.status,
        headers: typedResponse.headers,
      }
    }

    return {
      data: undefined,
      status: undefined,
      headers: undefined,
    }
  },
}