import ds from './src/config/typeorm.config';

async function getOTP() {
    try {
        await ds.initialize();
        const otp = await ds.query("SELECT code FROM otps WHERE type = 'TWO_FACTOR_AUTH' ORDER BY \"createdAt\" DESC LIMIT 1");
        console.log('OTP:', otp[0]?.code);
        await ds.destroy();
    } catch (e) {
        console.error(e);
    }
}

getOTP();
