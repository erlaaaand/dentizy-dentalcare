import { toast } from 'sonner';
import { uploadsHelpers } from '../../service/api/uploads/helpers/uploads.helpers';
import { useUploadProfilePhoto } from './mutations';

export function useFileUpload() {
  const upload = useUploadProfilePhoto();

  const uploadWithValidation = async (
    file: File,
    options?: {
      maxSizeMB?: number;
      compress?: boolean;
      maxWidth?: number;
      quality?: number;
    }
  ) => {
    // Validate and prepare file
    const validation = await uploadsHelpers.validateAndPrepareFile(file, options);

    if (!validation.valid) {
      toast.error(validation.error);
      return { success: false, error: validation.error };
    }

    try {
      const result = await upload.mutateAsync(validation.file!);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  };

  return {
    upload: uploadWithValidation,
    uploadRaw: upload.mutate,
    uploadRawAsync: upload.mutateAsync,
    isUploading: upload.isPending,
    error: upload.error,
    reset: upload.reset,
    helpers: uploadsHelpers
  };
}