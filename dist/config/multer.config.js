"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            const userId = req.user?.id || 'unknown';
            const uploadPath = `uploads/kyc/${userId}`;
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const documentType = req.body.documentType || 'document';
            const timestamp = Date.now();
            const ext = (0, path_1.extname)(file.originalname);
            cb(null, `${documentType}_${timestamp}${ext}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map