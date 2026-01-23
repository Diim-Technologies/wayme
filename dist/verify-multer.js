"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer_config_1 = require("./src/config/multer.config");
const mockRequest = {};
const mockCb = (err, accepted) => {
    if (err) {
        console.log(`Rejected: ${err.message}`);
    }
    else {
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
    multer_config_1.multerConfig.fileFilter(mockRequest, file, mockCb);
});
//# sourceMappingURL=verify-multer.js.map