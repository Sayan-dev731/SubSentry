const nodemailer = require('nodemailer');

// Create reusable transporter
// Supports both new (EMAIL_*) and legacy (GMAIL/APP_PASS) environment variables
const createTransport = () => {
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL;
    const emailPass = process.env.EMAIL_PASS || process.env.APP_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = process.env.EMAIL_PORT || 587;

    if (!emailUser || !emailPass) {
        throw new Error('Email credentials not configured. Set EMAIL_USER/EMAIL_PASS or GMAIL/APP_PASS in .env');
    }

    return nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: false, // true for 465, false for other ports
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

// Send email function
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = createTransport();
        const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.GMAIL;

        const mailOptions = {
            from: fromEmail,
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✉️  Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

// Send subscription reminder
const sendSubscriptionReminder = async (subscription, userEmail, userName) => {
    const daysUntil = Math.ceil(
        (new Date(subscription.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const subject = `Reminder: ${subscription.name} renewal in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Subscription Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a reminder that your subscription is coming up for renewal:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">${subscription.name}</h3>
        <p><strong>Amount:</strong> $${subscription.amount}</p>
        <p><strong>Billing Cycle:</strong> ${subscription.billing_cycle}</p>
        <p><strong>Next Billing Date:</strong> ${new Date(subscription.next_billing_date).toLocaleDateString()}</p>
        ${subscription.category ? `<p><strong>Category:</strong> ${subscription.category}</p>` : ''}
      </div>
      
      <p>Make sure you have sufficient funds in your account to avoid any service interruption.</p>
      
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        This is an automated reminder from SubSentry. 
        You're receiving this because you've subscribed to subscription reminders.
      </p>
    </div>
  `;

    const text = `
    Hi ${userName},
    
    This is a reminder that your subscription is coming up for renewal:
    
    Subscription: ${subscription.name}
    Amount: $${subscription.amount}
    Billing Cycle: ${subscription.billing_cycle}
    Next Billing Date: ${new Date(subscription.next_billing_date).toLocaleDateString()}
    ${subscription.category ? `Category: ${subscription.category}` : ''}
    
    Make sure you have sufficient funds in your account to avoid any service interruption.
  `;

    return await sendEmail({ to: userEmail, subject, text, html });
};

module.exports = {
    sendEmail,
    sendSubscriptionReminder
};
