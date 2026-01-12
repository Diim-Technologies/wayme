const axios = require('axios');

async function testVerification() {
    try {
        const res = await axios.post('http://localhost:3000/api/v1/auth/verify-2fa', {
            email: 'kyctest@example.com',
            code: '434650'
        });
        console.log('Response:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.log('Error Response:', JSON.stringify(e.response.data, null, 2));
        } else {
            console.error('Error:', e.message);
        }
    }
}

testVerification();
