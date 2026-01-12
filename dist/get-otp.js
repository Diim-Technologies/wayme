"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./src/config/typeorm.config");
async function getOTP() {
    try {
        await typeorm_config_1.default.initialize();
        const otp = await typeorm_config_1.default.query("SELECT code FROM otps WHERE type = 'TWO_FACTOR_AUTH' ORDER BY \"createdAt\" DESC LIMIT 1");
        console.log('OTP:', otp[0]?.code);
        await typeorm_config_1.default.destroy();
    }
    catch (e) {
        console.error(e);
    }
}
getOTP();
//# sourceMappingURL=get-otp.js.map