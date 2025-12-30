require('dotenv').config();
const { sendSMS } = require('./src/services/smsService');

async function testSMS() {
  try {
    // Replace with YOUR phone number
    const phoneNumber = '+4917635874836';
    const message = 'Test message from AutoBuy Guard!';
    
    console.log('Sending test SMS...');
    const result = await sendSMS(phoneNumber, message);
    console.log('Success!', result);
  } catch (error) {
    console.error('Failed:', error);
  }
}

testSMS();