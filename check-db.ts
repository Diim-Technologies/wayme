import ds from './src/config/typeorm.config';
import * as fs from 'fs';

async function check() {
    try {
        await ds.initialize();
        const tables = await ds.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tableNames = tables.map((t: any) => t.table_name);

        const userCols = await ds.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");

        // Check for CZK fee configuration
        const czkFee = await ds.query("SELECT * FROM fees WHERE currency = 'CZK' AND isActive = true");
        const czkFeeStatus = czkFee.length > 0 ? 'CZK fee configuration found.' : 'No CZK fee configuration found!';

        // Check for duplicate users (email or phoneNumber)
        const duplicateUsers = await ds.query(`
            SELECT email, phoneNumber, COUNT(*) as count
            FROM users
            WHERE isDeleted = false
            GROUP BY email, phoneNumber
            HAVING COUNT(*) > 1
        `);

        const report = {
            tables: tableNames,
            userColumns: userCols,
            czkFeeStatus,
            duplicateUsers
        };

        fs.writeFileSync('db-report.json', JSON.stringify(report, null, 2));
        console.log('Report saved to db-report.json');

        await ds.destroy();
    } catch (e) {
        console.error(e);
    }
}

check();
