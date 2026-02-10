import { BaseService } from '../../base/base.service';
import {
  uploadsControllerUploadFile
} from '../../../api/generated/uploads/uploads';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Uploads Service
 * Handles all file upload-related API calls
 * Extends BaseService for common query operations
 */
export class UploadsService extends BaseService {
  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<UploadResponse> {
    const response = await uploadsControllerUploadFile({
      file: file
    });
    
    if (response.status === 201 || response.status === 200) {
      return response.data as UploadResponse;
    }
    
    throw new Error('Failed to upload file');
  }

  /**
   * Upload any file
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    return this.uploadProfilePhoto(file);
  }
}

export const uploadsService = new UploadsService();