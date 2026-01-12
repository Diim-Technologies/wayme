import { Request } from 'express';
export declare const multerConfig: {
    storage: import("multer").StorageEngine;
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => void;
    limits: {
        fileSize: number;
    };
};
