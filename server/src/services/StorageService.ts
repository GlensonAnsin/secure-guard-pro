import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

class StorageService {
  private storage: StorageEngine;
  private uploadDir: string;

  /**
   * Allowed MIME types mapped to their expected extensions.
   * This prevents MIME type spoofing.
   */
  private static readonly ALLOWED_TYPES: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
  };

  constructor() {
    // 1. Define where files go
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // 2. Configure Disk Storage
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // Sanitize: strip path separators and null bytes from original name
        const sanitizedOriginal = file.originalname
          .replace(/[/\\:*?"<>|\x00]/g, '') // Remove dangerous characters
          .replace(/\.\./g, '');             // Remove path traversal

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(sanitizedOriginal).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    });
  }

  /**
   * Get the Multer instance with validation rules.
   */
  public get uploader() {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 1,                   // Only 1 file per request
      },
      fileFilter: this.fileFilter,
    });
  }

  /**
   * Validate file MIME type AND extension match.
   */
  private fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const allowedMimeTypes = Object.keys(StorageService.ALLOWED_TYPES);
    const ext = path.extname(file.originalname).toLowerCase();

    // 1. Check MIME type is allowed
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
      return;
    }

    // 2. Check extension matches MIME type (prevent spoofing)
    const expectedExtensions = StorageService.ALLOWED_TYPES[file.mimetype];
    if (!expectedExtensions || !expectedExtensions.includes(ext)) {
      cb(new Error('File extension does not match its content type.'));
      return;
    }

    cb(null, true);
  }
}

export default new StorageService();