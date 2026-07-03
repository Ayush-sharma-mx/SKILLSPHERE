const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Get or create the mail transporter.
 * In development with no EMAIL_USER set, auto-creates a free Ethereal test account.
 * Emails won't actually be delivered but the registration flow completes successfully.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  const isDev = process.env.NODE_ENV !== 'production';
  const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.includes('your_email');

  if (isDev && !hasCredentials) {
    // Auto-generate a free Ethereal test account (ethereal.email)
    const testAccount = await nodemailer.createTestAccount();
    console.log('\n📧 Ethereal dev email account created:');
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log('   Preview emails at: https://ethereal.email/messages\n');

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: parseInt(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

/**
 * SkillSphere branded email HTML wrapper
 */
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SkillSphere</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FDFCFB; font-family: 'Segoe UI', system-ui, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e8e4df; }
    .header { background: linear-gradient(135deg, #111110 0%, #2a2520 100%); padding: 40px 32px; text-align: center; position: relative; }
    .header::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(234,108,42,0.25) 0%, transparent 70%); pointer-events: none; }
    .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; position: relative; }
    .header h1 span { color: #EA6C2A; }
    .header p { color: rgba(255,255,255,0.55); margin: 8px 0 0; font-size: 13px; position: relative; }
    .body { padding: 40px 32px; }
    .body p { color: #374151; line-height: 1.75; font-size: 15px; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 14px 32px; background: #EA6C2A; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; margin: 20px 0; letter-spacing: -0.2px; }
    .info-box { background: #f7f4f1; border-left: 4px solid #EA6C2A; padding: 16px 20px; border-radius: 8px; margin: 20px 0; }
    .info-box p { margin: 0 0 4px; color: #6b6762; font-size: 14px; }
    .footer { background: #f7f4f1; padding: 24px 32px; text-align: center; border-top: 1px solid #e8e4df; }
    .footer p { color: #b5afa9; font-size: 12px; margin: 0; }
    .footer a { color: #EA6C2A; text-decoration: none; }
    .divider { height: 1px; background: #e8e4df; margin: 24px 0; }
    .highlight { color: #EA6C2A; font-weight: 700; }
    .name { color: #111110; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Skill<span>Sphere</span></h1>
      <p>India's AI-Powered Freelance Platform</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SkillSphere. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="${process.env.CLIENT_URL}">Visit SkillSphere</a> ·
        <a href="${process.env.CLIENT_URL}/privacy">Privacy</a> ·
        <a href="${process.env.CLIENT_URL}/terms">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send email verification link
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const t = await getTransporter();

  const html = emailWrapper(`
    <p>Hi <span class="name">${user.name}</span>,</p>
    <p>Welcome to <span class="highlight">SkillSphere</span>! 🎉 We're thrilled to have you on board.</p>
    <p>Please verify your email address to unlock full access to your account.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}" class="btn">✉️ Verify My Email</a>
    </div>
    <div class="info-box">
      <p>⏰ This link expires in <strong>24 hours</strong>.</p>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; color: #9a9590;">Didn't sign up? You can safely ignore this email.</p>
    <p style="font-size: 13px; color: #9a9590;">Button not working? Copy this link:<br/>
      <a href="${verificationUrl}" style="color: #EA6C2A; word-break: break-all;">${verificationUrl}</a>
    </p>
  `);

  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || 'SkillSphere <noreply@skillsphere.com>',
    to: user.email,
    subject: '✉️ Verify Your SkillSphere Account',
    html,
  });

  // In dev, log Ethereal preview URL
  if (process.env.NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📧 Preview email at:', previewUrl);
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const t = await getTransporter();

  const html = emailWrapper(`
    <p>Hi <span class="name">${user.name}</span>,</p>
    <p>We received a request to reset your <span class="highlight">SkillSphere</span> password.</p>
    <p>Click below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="btn">🔐 Reset My Password</a>
    </div>
    <div class="info-box">
      <p>⚠️ Didn't request this? Ignore this email — your password won't change.</p>
    </div>
    <div class="divider"></div>
    <p style="font-size: 13px; color: #9a9590;">Link not working? Copy this URL:<br/>
      <a href="${resetUrl}" style="color: #EA6C2A; word-break: break-all;">${resetUrl}</a>
    </p>
  `);

  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || 'SkillSphere <noreply@skillsphere.com>',
    to: user.email,
    subject: '🔐 Reset Your SkillSphere Password',
    html,
  });

  if (process.env.NODE_ENV !== 'production') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📧 Preview email at:', previewUrl);
  }
};

/**
 * Send project match notification to freelancer
 */
const sendProjectNotificationEmail = async (freelancer, project) => {
  const projectUrl = `${process.env.CLIENT_URL}/projects/${project._id}`;
  const t = await getTransporter();

  const html = emailWrapper(`
    <p>Hi <span class="name">${freelancer.name}</span>,</p>
    <p>🎯 Our AI found a new project that matches your skills!</p>
    <div class="info-box">
      <p><strong>📋 Project:</strong> ${project.title}</p>
      <p><strong>💰 Budget:</strong> ₹${project.budget?.min || 0} – ₹${project.budget?.max || 'Open'}</p>
      <p><strong>🏷️ Category:</strong> ${project.category || 'General'}</p>
      <p><strong>🛠️ Skills:</strong> ${(project.requiredSkills || []).join(', ') || 'Various'}</p>
    </div>
    <p>${project.description ? project.description.substring(0, 200) + '...' : 'See project for full details.'}</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${projectUrl}" class="btn">🚀 View Project &amp; Apply</a>
    </div>
  `);

  await t.sendMail({
    from: process.env.EMAIL_FROM || 'SkillSphere <noreply@skillsphere.com>',
    to: freelancer.email,
    subject: `🎯 New AI Match: ${project.title}`,
    html,
  });
};

/**
 * Send payment notification email
 */
const sendPaymentEmail = async (user, amount, type) => {
  const typeConfig = {
    received: { emoji: '💰', subject: '💰 Payment Received on SkillSphere', title: 'Payment Received!', message: `A payment of <strong>₹${amount.toLocaleString()}</strong> has been captured and is held securely in escrow.` },
    sent:     { emoji: '📤', subject: '📤 Payment Sent on SkillSphere',     title: 'Payment Sent',     message: `Your payment of <strong>₹${amount.toLocaleString()}</strong> is held in escrow until the milestone is approved.` },
    released: { emoji: '🎉', subject: '🎉 Payment Released on SkillSphere', title: 'Payment Released!',message: `<strong>₹${amount.toLocaleString()}</strong> has been released to your account. Congratulations!` },
    refunded: { emoji: '🔄', subject: '🔄 Payment Refunded on SkillSphere', title: 'Payment Refunded', message: `A refund of <strong>₹${amount.toLocaleString()}</strong> has been processed. Allow 5–7 business days.` },
  };

  const config = typeConfig[type] || typeConfig['received'];
  const t = await getTransporter();

  const html = emailWrapper(`
    <p>Hi <span class="name">${user.name}</span>,</p>
    <h2 style="color: #EA6C2A; margin: 0 0 16px; font-size: 22px;">${config.emoji} ${config.title}</h2>
    <p>${config.message}</p>
    <div class="info-box">
      <p><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.CLIENT_URL}/payments" class="btn">View Payment History</a>
    </div>
  `);

  await t.sendMail({
    from: process.env.EMAIL_FROM || 'SkillSphere <noreply@skillsphere.com>',
    to: user.email,
    subject: config.subject,
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendProjectNotificationEmail,
  sendPaymentEmail,
};
