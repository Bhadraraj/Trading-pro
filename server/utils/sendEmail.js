import nodemailer from 'nodemailer';
import logger from './logger.js';

export const sendEmail = async (options) => {
  try {
    // In development, we'll log emails to console instead of sending them
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_EMAIL) {
      logger.info('=== EMAIL NOTIFICATION (Development Mode) ===');
      logger.info(`To: ${options.email}`);
      logger.info(`Subject: ${options.subject}`);
      logger.info(`Message: ${options.message}`);
      logger.info('=== END EMAIL ===');
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { messageId: 'dev-mode-' + Date.now() };
    }

    // Create transporter for production
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    await transporter.verify();

    const message = {
      from: `${process.env.FROM_NAME || 'TradePro'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(message);
    logger.info(`Email sent successfully: ${info.messageId}`);
    return info;
    
  } catch (error) {
    logger.error('Email sending failed:', error.message);
    
    // In development, don't throw error for email failures
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Email sending failed in development mode - continuing...');
      return { messageId: 'dev-mode-failed-' + Date.now() };
    }
    
    throw new Error('Email could not be sent');
  }
};