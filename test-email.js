const nodemailer = require('nodemailer');

// SMTP Configuration
const config = {
    host: 'diimdevs.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
        user: 'waymesupport@diimdevs.com',
        pass: 'Ability_2.1',
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
    },
    debug: true,
    logger: true,
};

console.log('==========================================');
console.log('Testing SMTP Connection...');
console.log('==========================================');
console.log('Host:', config.host);
console.log('Port:', config.port);
console.log('User:', config.auth.user);
console.log('Secure:', config.secure);
console.log('==========================================\n');

// Create transporter
const transporter = nodemailer.createTransport(config);

// Test 1: Verify connection
console.log('Test 1: Verifying SMTP connection...');
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection FAILED:');
        console.error(error);
        console.log('\n==========================================');
        console.log('POSSIBLE ISSUES:');
        console.log('1. Check if the password is correct');
        console.log('2. Verify the SMTP host is accessible');
        console.log('3. Check if port 465 is not blocked by firewall');
        console.log('4. Confirm the email account exists');
        console.log('==========================================\n');
        process.exit(1);
    } else {
        console.log('✅ SMTP Connection Successful!');
        console.log('Server is ready to take our messages\n');

        // Test 2: Send a test email
        console.log('Test 2: Sending test email...');
        const mailOptions = {
            from: 'waymesupport@diimdevs.com',
            to: 'waymesupport@diimdevs.com', // Send to self for testing
            subject: 'Test Email from Wayame - ' + new Date().toLocaleString(),
            html: `
        <h2>✅ Email Test Successful</h2>
        <p>This is a test email sent from the Wayame application.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If you receive this email, your SMTP configuration is working correctly!</p>
      `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Failed to send test email:');
                console.error(error);
                process.exit(1);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
                console.log('Response:', info.response);
                console.log('\n==========================================');
                console.log('SUCCESS! Your email configuration is working.');
                console.log('==========================================\n');
                process.exit(0);
            }
        });
    }
});
