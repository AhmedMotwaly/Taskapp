// src/services/smsService.js
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Initialize SNS Client (AWS SDK v3)
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'eu-central-1', // Must match your AWS Console Region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// ============================================
// SEND SMS via AWS SNS
// ============================================
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!phoneNumber) return { success: false, error: 'No phone number provided' };

    // Format phone number (Basic cleaning)
    let formattedNumber = phoneNumber.trim();
    
    // Ensure German/European numbers have correct country code if missing
    // (Adjust this logic if your users are global)
    if (!formattedNumber.startsWith('+')) {
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+49' + formattedNumber.substring(1);
      } else if (formattedNumber.startsWith('49')) {
        formattedNumber = '+' + formattedNumber;
      } else {
        // Fallback: assume +49 if completely missing
        formattedNumber = '+49' + formattedNumber;
      }
    }

    console.log(`[SMS] Sending to ${formattedNumber}: ${message.substring(0, 50)}...`);

    const params = {
      Message: message,
      PhoneNumber: formattedNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional' // Crucial for alerts: ensures higher priority
        }
      }
    };

    const command = new PublishCommand(params);
    const result = await snsClient.send(command);

    console.log(`[SMS] Sent successfully! Message ID: ${result.MessageId}`);
    return { success: true, messageId: result.MessageId };

  } catch (error) {
    console.error('[SMS] Error:', error.message);
    // Don't crash the server if SMS fails
    return { success: false, error: error.message };
  }
};

// ============================================
// SEND RESTOCK SMS
// ============================================
const sendRestockSMS = async (phoneNumber, productTitle, productUrl) => {
  try {
    // Keep it short (under 160 chars is cheaper/safer)
    const shortTitle = productTitle.substring(0, 30);
    const message = `🎉 Back in Stock: "${shortTitle}" is available now! ${productUrl}`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('[SMS] Restock SMS error:', error);
  }
};

// ============================================
// SEND PRICE ALERT SMS
// ============================================
const sendPriceAlertSMS = async (phoneNumber, productTitle, newPrice, targetPrice) => {
  try {
    const shortTitle = productTitle.substring(0, 30);
    const message = `🎯 Price Drop: "${shortTitle}" is now €${newPrice} (Target: €${targetPrice})!`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('[SMS] Price alert SMS error:', error);
  }
};

module.exports = { 
  sendSMS, 
  sendRestockSMS, 
  sendPriceAlertSMS 
};