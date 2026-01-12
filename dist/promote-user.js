"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./src/config/typeorm.config");
async function promote() {
    try {
        await typeorm_config_1.default.initialize();
        await typeorm_config_1.default.query("UPDATE users SET role = 'ADMIN' WHERE email = 'kyctest@example.com'");
        console.log('User promoted to ADMIN');
        await typeorm_config_1.default.destroy();
    }
    catch (e) {
        console.error(e);
    }
}
promote();
//# sourceMappingURL=promote-user.js.map