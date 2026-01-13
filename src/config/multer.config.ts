import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import * as fs from 'fs';

export const multerConfig = {
    storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb) => {
            const userId = (req as any).user?.id || 'unknown';
            const uploadPath = join(process.cwd(), 'uploads', 'kyc', userId);

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
            const documentType = (req.body as any).documentType || 'document';
            const timestamp = Date.now();
            const ext = extname(file.originalname);
            cb(null, `${documentType}_${timestamp}${ext}`);
        },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/heic',
            'image/heif',
            'image/webp',
            'application/pdf',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, HEIC, WEBP and PDF files are allowed.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
};
