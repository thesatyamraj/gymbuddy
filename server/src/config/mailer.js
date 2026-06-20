/**
 * Email sending via Brevo's HTTP API (https://api.brevo.com).
 *
 * We use the HTTP API instead of SMTP/Nodemailer because Render's free tier
 * blocks all outbound traffic on SMTP ports (25, 465, 587) as of Sept 2025.
 * The HTTP API runs over port 443 (standard HTTPS), which is never blocked.
 *
 * Required env var: BREVO_API_KEY
 * The "from" address must be a verified sender in your Brevo account
 * (Senders, Domains & Dedicated IPs → Senders → verify via the emailed link).
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Low-level helper that POSTs a single email to Brevo's transactional API.
 * @param {{ to: string, subject: string, html: string }} params
 * @returns {Promise<void>}
 */
const sendViaBrevo = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
  }
  if (!senderEmail) {
    throw new Error('SMTP_FROM or SMTP_USER must be set to a verified Brevo sender email');
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'GymBuddy Finder', email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const errBody = await response.json();
      detail = errBody.message || JSON.stringify(errBody);
    } catch {
      detail = await response.text();
    }
    throw new Error(`Brevo API error (${response.status}): ${detail}`);
  }
};

/**
 * Send OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP code (plaintext, before hashing)
 * @param {string} name - User's name for personalization
 * @returns {Promise<void>}
 */
const sendOtpEmail = async (to, otp, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 16px; padding: 14px; margin-bottom: 16px;">
              <span style="font-size: 28px;">🏋️</span>
            </div>
            <h1 style="color: #1e293b; font-size: 24px; margin: 0;">GymBuddy Finder</h1>
          </div>

          <!-- Greeting -->
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
            Hey <strong>${name}</strong>! 👋
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
            Use the code below to verify your email and create your GymBuddy account:
          </p>

          <!-- OTP Code -->
          <div style="background: linear-gradient(135deg, #eef2ff, #e0e7ff); border: 2px solid #c7d2fe; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>

          <!-- Expiry Notice -->
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-bottom: 24px;">
            ⏱️ This code expires in <strong>10 minutes</strong>
          </p>

          <!-- Security Notice -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
              If you didn't request this code, you can safely ignore this email. Never share this code with anyone.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
          © ${new Date().getFullYear()} GymBuddy Finder. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendViaBrevo({
    to,
    subject: '🔐 Your GymBuddy Verification Code',
    html,
  });
};

/**
 * Send OTP email for password change verification
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP code (plaintext, before hashing)
 * @param {string} name - User's name for personalization
 * @returns {Promise<void>}
 */
const sendPasswordChangeOtpEmail = async (to, otp, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 16px; padding: 14px; margin-bottom: 16px;">
              <span style="font-size: 28px;">🔒</span>
            </div>
            <h1 style="color: #1e293b; font-size: 24px; margin: 0;">Password Change</h1>
          </div>

          <!-- Greeting -->
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
            Hey <strong>${name}</strong>! 👋
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
            You requested to change your password. Use the code below to verify it's you:
          </p>

          <!-- OTP Code -->
          <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fecaca; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>

          <!-- Expiry Notice -->
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-bottom: 24px;">
            ⏱️ This code expires in <strong>10 minutes</strong>
          </p>

          <!-- Security Notice -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
              ⚠️ If you didn't request this password change, please ignore this email. Your password will remain unchanged. Never share this code with anyone.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
          © ${new Date().getFullYear()} GymBuddy Finder. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendViaBrevo({
    to,
    subject: '🔒 Verify Your Password Change — GymBuddy',
    html,
  });
};

/**
 * Verify that email sending is configured (checks for required env vars).
 * Brevo has no persistent "connection" to test like SMTP does, so this just
 * confirms the required credentials are present at startup.
 * @returns {Promise<boolean>}
 */
const verifyMailer = async () => {
  if (!process.env.BREVO_API_KEY) {
    console.log('⚠️  BREVO_API_KEY not configured — email OTP will not work');
    return false;
  }
  if (!process.env.SMTP_FROM && !process.env.SMTP_USER) {
    console.log('⚠️  SMTP_FROM / SMTP_USER not configured — no verified sender email set');
    return false;
  }
  console.log('📧 Brevo email sender configured');
  return true;
};

module.exports = { sendOtpEmail, sendPasswordChangeOtpEmail, verifyMailer };