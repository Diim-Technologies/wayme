import ds from './src/config/typeorm.config';

async function promote() {
    try {
        await ds.initialize();
        await ds.query("UPDATE users SET role = 'ADMIN' WHERE email = 'kyctest@example.com'");
        console.log('User promoted to ADMIN');
        await ds.destroy();
    } catch (e) {
        console.error(e);
    }
}

promote();
