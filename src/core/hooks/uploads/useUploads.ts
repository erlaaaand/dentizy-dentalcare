// src/core/hooks/useUploads.ts
import { useUploadsControllerUploadFile } from "@/src/core/api/generated/uploads/uploads"
import type { UploadsControllerUploadFileMutationResult } from "@/src/core/api/generated/uploads/uploads.ts"

export const useUploads = () => {
  /**
   * Hook untuk upload file foto profil
   */
  const uploadFile = useUploadsControllerUploadFile({
    mutation: {
      onSuccess: (data: UploadsControllerUploadFileMutationResult) => {
        console.log("Upload berhasil:", data)
      },
      onError: (error) => {
        console.error("Upload gagal:", error)
      },
    },
  })

  return {
    uploadFile,
  }
}