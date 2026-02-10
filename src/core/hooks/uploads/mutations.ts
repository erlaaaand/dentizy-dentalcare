import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { uploadsService } from '../../service/api/uploads/uploads.api';

export const useUploadProfilePhoto = createMutationHook({
  mutationFn: (file: File) => uploadsService.uploadProfilePhoto(file),
  onSuccess: () => {
    toast.success('Foto profil berhasil diupload');
  },
  onError: () => {
    toast.error('Gagal mengupload foto profil');
  }
});