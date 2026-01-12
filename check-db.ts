import ds from './src/config/typeorm.config';
import * as fs from 'fs';

async function check() {
    try {
        await ds.initialize();
        const tables = await ds.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tableNames = tables.map((t: any) => t.table_name);

        const userCols = await ds.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");

        const report = {
            tables: tableNames,
            userColumns: userCols
        };

        fs.writeFileSync('db-report.json', JSON.stringify(report, null, 2));
        console.log('Report saved to db-report.json');

        await ds.destroy();
    } catch (e) {
        console.error(e);
    }
}

check();
