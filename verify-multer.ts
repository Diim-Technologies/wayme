
import { multerConfig } from './src/config/multer.config';

const mockRequest = {} as any;
const mockCb = (err: any, accepted: boolean) => {
    if (err) {
        console.log(`Rejected: ${err.message}`);
    } else {
        console.log(`Accepted: ${accepted}`);
    }
};

const testTypes = [
    { mimetype: 'image/jpeg', originalname: 'test.jpg' },
    { mimetype: 'image/heic', originalname: 'test.heic' },
    { mimetype: 'image/webp', originalname: 'test.webp' },
    { mimetype: 'image/gif', originalname: 'test.gif' },
];

console.log('--- Testing Multer File Filter ---');
testTypes.forEach(file => {
    console.log(`Testing ${file.mimetype}...`);
    (multerConfig.fileFilter as any)(mockRequest, file as any, mockCb);
});
