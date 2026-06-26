const nodemailer = require('nodemailer');

const getBooleanEnv = (value) => value === 'true' || value === '1';

/**
 * Creates an SMTP transport when mail settings are configured. In local
 * development, jsonTransport keeps password-reset flows testable without
 * requiring external email credentials.
 */
const createTransport = () => {
  if (!process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }

  const transportConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: getBooleanEnv(process.env.SMTP_SECURE)
  };

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };
  }

  return nodemailer.createTransport(transportConfig);
};

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const transporter = createTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'Edja Wallet <no-reply@edjawallet.local>';

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Reset your Edja Wallet password',
    text: [
      'We received a request to reset your Edja Wallet password.',
      '',
      `Open this link to choose a new password: ${resetUrl}`,
      '',
      'This link expires in 1 hour. If you did not request a reset, you can ignore this email.'
    ].join('\n'),
    html: `
      <p>We received a request to reset your Edja Wallet password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
    `
  });

  if (!process.env.SMTP_HOST && info.message) {
    console.log(`[DEV EMAIL] ${info.message}`);
  }

  return info;
};

module.exports = {
  sendPasswordResetEmail
};
