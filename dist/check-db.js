"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_config_1 = require("./src/config/typeorm.config");
const fs = require("fs");
async function check() {
    try {
        await typeorm_config_1.default.initialize();
        const tables = await typeorm_config_1.default.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tableNames = tables.map((t) => t.table_name);
        const userCols = await typeorm_config_1.default.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        const report = {
            tables: tableNames,
            userColumns: userCols
        };
        fs.writeFileSync('db-report.json', JSON.stringify(report, null, 2));
        console.log('Report saved to db-report.json');
        await typeorm_config_1.default.destroy();
    }
    catch (e) {
        console.error(e);
    }
}
check();
//# sourceMappingURL=check-db.js.map