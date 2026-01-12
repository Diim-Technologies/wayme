"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./src/config/typeorm.config");
const fs = require("fs");
async function check() {
    try {
        await typeorm_config_1.default.initialize();
        const profileCols = await typeorm_config_1.default.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_profiles'");
        fs.writeFileSync('profile-cols.json', JSON.stringify(profileCols, null, 2));
        console.log('Report saved to profile-cols.json');
        await typeorm_config_1.default.destroy();
    }
    catch (e) {
        console.error(e);
    }
}
check();
//# sourceMappingURL=check-profile.js.map