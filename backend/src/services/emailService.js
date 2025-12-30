const nodemailer = require('nodemailer');

// 1. CONFIGURE TRANSPORTER (UPDATED FOR NAMECHEAP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.privateemail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================================
// SEND EMAIL
// ============================================
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"AutoBuy Guard" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return result;

  } catch (error) {
    console.error('[EMAIL] Error:', error.message);
    throw error; // Rethrow so the caller knows it failed
  }
};

// ============================================
// SEND PRICE ALERT
// ============================================
const sendPriceAlertEmail = async (userEmail, item, newPrice, oldPrice) => {
  const subject = `🎯 Price Alert: ${item.title?.substring(0, 50)}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00f3ff;">🎯 Target Price Hit!</h2>
      <p>Great news! The price dropped to your target.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${item.title}</h3>
        <p style="margin: 5px 0;"><strong>Old Price:</strong> €${oldPrice}</p>
        <p style="margin: 5px 0;"><strong>New Price:</strong> <span style="color: #00cc00; font-size: 1.2em;">€${newPrice}</span></p>
        <p style="margin: 5px 0;"><strong>Your Target:</strong> €${item.targetPrice}</p>
      </div>
      
      <a href="${item.url}" style="display: inline-block; background: #00f3ff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Buy Now →
      </a>
    </div>
  `;

  return sendEmail(userEmail, subject, html);
};

// ============================================
// SEND WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = '🚀 Welcome to AutoBuy Guard!';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00f3ff;">Welcome, ${userName || 'Hunter'}!</h2>
      <p>Your account is ready. Start tracking products and we'll alert you when prices drop.</p>
      
      <h3>Quick Start:</h3>
      <ol>
        <li>Go to Deal Sniper mode</li>
        <li>Paste a product URL</li>
        <li>Set your target price</li>
      </ol>
      
      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        Happy hunting!<br>
        The AutoBuy Guard Team
      </p>
    </div>
  `;

  return sendEmail(userEmail, subject, html);
};

module.exports = { 
  sendEmail, 
  sendPriceAlertEmail, 
  sendWelcomeEmail 
};