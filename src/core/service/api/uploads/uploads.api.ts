import { BaseService } from '../../base/base.service';
import {
  uploadsControllerUploadFile
} from '../../../api/generated/uploads/uploads';

import type { QueryClient } from '@tanstack/react-query';

// Re-export hooks
export {
  useUploadsControllerUploadFile
} from '../../../api/generated/uploads/uploads';

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

class UploadsService extends BaseService {

  async uploadProfilePhoto(file: File): Promise<UploadResponse> {
    const response = await uploadsControllerUploadFile({
      file: file
    });
    
    if (response.status === 201 || response.status === 200) {
      return response.data as UploadResponse;
    }
    
    throw new Error('Failed to upload file');
  }
  
  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/uploads'] as const);
  }
}

export const uploadsService = new UploadsService();

// Helper functions
export const uploadsHelpers = {
  /**
   * Validate file type
   */
  isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  },

  /**
   * Validate file size (default: 5MB)
   */
  isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Create object URL for preview
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  },

  /**
   * Revoke object URL
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  },

  /**
   * Compress image before upload
   */
  async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate and prepare file for upload
   */
  async validateAndPrepareFile(
    file: File,
    options?: {
      maxSizeMB?: number;
      compress?: boolean;
      maxWidth?: number;
      quality?: number;
    }
  ): Promise<{ valid: boolean; file?: File; error?: string }> {
    const { maxSizeMB = 5, compress = true, maxWidth = 800, quality = 0.8 } = options || {};

    // Validate type
    if (!this.isValidImageType(file)) {
      return {
        valid: false,
        error: 'Tipe file tidak valid. Gunakan JPEG, PNG, GIF, atau WebP.'
      };
    }

    // Validate size before compression
    if (!compress && !this.isValidFileSize(file, maxSizeMB)) {
      return {
        valid: false,
        error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`
      };
    }

    // Compress if needed
    let processedFile = file;
    if (compress) {
      try {
        processedFile = await this.compressImage(file, maxWidth, quality);
        
        // Check size after compression
        if (!this.isValidFileSize(processedFile, maxSizeMB)) {
          return {
            valid: false,
            error: `Ukuran file terlalu besar setelah kompresi. Maksimal ${maxSizeMB}MB.`
          };
        }
      } catch {
        return {
          valid: false,
          error: 'Gagal memproses gambar.'
        };
      }
    }

    return {
      valid: true,
      file: processedFile
    };
  }
};