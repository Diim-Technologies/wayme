import ds from './src/config/typeorm.config';
import * as fs from 'fs';

async function check() {
    try {
        await ds.initialize();

        const profileCols = await ds.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_profiles'");

        fs.writeFileSync('profile-cols.json', JSON.stringify(profileCols, null, 2));
        console.log('Report saved to profile-cols.json');

        await ds.destroy();
    } catch (e) {
        console.error(e);
    }
}

check();
