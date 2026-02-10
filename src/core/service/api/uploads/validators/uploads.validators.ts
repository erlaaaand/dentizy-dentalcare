export interface ValidationError {
  field: string;
  message: string;
}

export interface FileValidation {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Uploads Validators
 * Validates file upload data before submission
 */
export class UploadsValidators {
  /**
   * Validate file exists
   */
  validateFileExists(file?: File): ValidationError | null {
    if (!file) {
      return { field: 'file', message: 'File wajib dipilih' };
    }
    return null;
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes?: string[]): ValidationError | null {
    const defaultAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const types = allowedTypes || defaultAllowedTypes;
    
    if (!types.includes(file.type)) {
      return {
        field: 'file',
        message: `Tipe file tidak valid. Gunakan: ${types.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
      };
    }
    
    return null;
  }

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSizeMB: number = 5): ValidationError | null {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return {
        field: 'file',
        message: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`
      };
    }
    
    if (file.size === 0) {
      return {
        field: 'file',
        message: 'File kosong atau rusak.'
      };
    }
    
    return null;
  }

  /**
   * Validate image dimensions
   */
  async validateImageDimensions(
    file: File,
    options?: {
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
    }
  ): Promise<ValidationError | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const { minWidth, minHeight, maxWidth, maxHeight } = options || {};
          
          if (minWidth && img.width < minWidth) {
            resolve({
              field: 'file',
              message: `Lebar gambar minimal ${minWidth}px`
            });
            return;
          }
          
          if (minHeight && img.height < minHeight) {
            resolve({
              field: 'file',
              message: `Tinggi gambar minimal ${minHeight}px`
            });
            return;
          }
          
          if (maxWidth && img.width > maxWidth) {
            resolve({
              field: 'file',
              message: `Lebar gambar maksimal ${maxWidth}px`
            });
            return;
          }
          
          if (maxHeight && img.height > maxHeight) {
            resolve({
              field: 'file',
              message: `Tinggi gambar maksimal ${maxHeight}px`
            });
            return;
          }
          
          resolve(null);
        };
        
        img.onerror = () => {
          resolve({
            field: 'file',
            message: 'Gagal membaca dimensi gambar'
          });
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        resolve({
          field: 'file',
          message: 'Gagal membaca file'
        });
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate file upload
   */
  async validateUpload(
    file?: File,
    options?: {
      allowedTypes?: string[];
      maxSizeMB?: number;
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
    }
  ): Promise<FileValidation> {
    const errors: ValidationError[] = [];

    // Validate file exists
    const fileExistsError = this.validateFileExists(file);
    if (fileExistsError) {
      errors.push(fileExistsError);
      return { isValid: false, errors };
    }

    // From here we know file exists
    const uploadFile = file!;

    // Validate type
    const typeError = this.validateFileType(uploadFile, options?.allowedTypes);
    if (typeError) errors.push(typeError);

    // Validate size
    const sizeError = this.validateFileSize(uploadFile, options?.maxSizeMB);
    if (sizeError) errors.push(sizeError);

    // Validate dimensions (only for images)
    if (uploadFile.type.startsWith('image/')) {
      const dimensionsError = await this.validateImageDimensions(uploadFile, {
        minWidth: options?.minWidth,
        minHeight: options?.minHeight,
        maxWidth: options?.maxWidth,
        maxHeight: options?.maxHeight
      });
      if (dimensionsError) errors.push(dimensionsError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const uploadsValidators = new UploadsValidators();