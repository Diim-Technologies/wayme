import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

export const multerConfig = {
    storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb) => {
            const userId = (req as any).user?.id || 'unknown';
            const uploadPath = `uploads/kyc/${userId}`;
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
            'application/pdf',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
};
