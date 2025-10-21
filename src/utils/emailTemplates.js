/**
 * Professional Email Templates
 * Microsoft 365-inspired design with clean, modern styling
 */

/**
 * Get email verification template
 * @param {string} verificationLink - The verification URL
 * @param {string} userEmail - User's email address
 * @returns {string} HTML email template
 */
function getVerificationEmailTemplate(verificationLink, userEmail) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - SubSentry</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #323130;
            background-color: #f3f2f1;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .email-header {
            background: linear-gradient(135deg, #0078D4 0%, #005A9E 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
        }
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .email-header p {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 400;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #323130;
            margin-bottom: 20px;
        }
        .message {
            font-size: 15px;
            color: #605E5C;
            margin-bottom: 24px;
            line-height: 1.7;
        }
        .cta-container {
            text-align: center;
            margin: 32px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0078D4 0%, #106EBE 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 4px;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(0, 120, 212, 0.3);
        }
        .cta-button:hover {
            background: linear-gradient(135deg, #106EBE 0%, #005A9E 100%);
            box-shadow: 0 4px 12px rgba(0, 120, 212, 0.4);
        }
        .info-box {
            background-color: #F3F2F1;
            border-left: 3px solid #0078D4;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .info-box p {
            font-size: 14px;
            color: #605E5C;
            margin: 0;
        }
        .alternative-link {
            background-color: #FAF9F8;
            padding: 16px;
            border-radius: 4px;
            margin: 24px 0;
            word-break: break-all;
        }
        .alternative-link p {
            font-size: 13px;
            color: #605E5C;
            margin-bottom: 8px;
        }
        .alternative-link a {
            color: #0078D4;
            text-decoration: none;
            font-size: 13px;
        }
        .email-footer {
            background-color: #FAF9F8;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #EDEBE9;
        }
        .footer-text {
            font-size: 13px;
            color: #8A8886;
            margin-bottom: 12px;
        }
        .footer-links {
            margin-top: 16px;
        }
        .footer-links a {
            color: #0078D4;
            text-decoration: none;
            font-size: 13px;
            margin: 0 12px;
        }
        .security-notice {
            background-color: #FFF4CE;
            border-left: 3px solid: #F7B731;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .security-notice p {
            font-size: 14px;
            color: #605E5C;
            margin: 0;
        }
        .security-notice strong {
            color: #323130;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-header {
                padding: 30px 20px;
            }
            .email-header h1 {
                font-size: 24px;
            }
            .email-body {
                padding: 30px 20px;
            }
            .cta-button {
                padding: 12px 24px;
                font-size: 14px;
            }
            .email-footer {
                padding: 24px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>SubSentry</h1>
            <p>Subscription Management Made Simple</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">Welcome to SubSentry!</div>
            
            <p class="message">
                Thank you for creating an account with us. We're excited to have you on board! 
                To get started and access all features of SubSentry, please verify your email address.
            </p>

            <div class="info-box">
                <p>
                    <strong>Account Email:</strong> ${userEmail}
                </p>
            </div>

            <div class="cta-container">
                <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
            </div>

            <p class="message">
                This verification link will expire in 24 hours for security reasons. 
                If you didn't create an account with SubSentry, you can safely ignore this email.
            </p>

            <div class="alternative-link">
                <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                <a href="${verificationLink}">${verificationLink}</a>
            </div>

            <div class="security-notice">
                <p>
                    <strong>Security Tip:</strong> Never share this verification link with anyone. 
                    SubSentry will never ask for your password via email.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                This email was sent by SubSentry to ${userEmail}
            </p>
            <p class="footer-text">
                © ${new Date().getFullYear()} SubSentry. All rights reserved.
            </p>
            <div class="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Support</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Get welcome email template (after verification)
 * @param {string} userEmail - User's email address
 * @param {string} dashboardLink - Link to dashboard
 * @returns {string} HTML email template
 */
function getWelcomeEmailTemplate(userEmail, dashboardLink) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SubSentry</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #323130;
            background-color: #f3f2f1;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .email-header {
            background: linear-gradient(135deg, #107C10 0%, #0B6A0B 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
        }
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .email-header p {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 400;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #323130;
            margin-bottom: 20px;
        }
        .message {
            font-size: 15px;
            color: #605E5C;
            margin-bottom: 24px;
            line-height: 1.7;
        }
        .cta-container {
            text-align: center;
            margin: 32px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0078D4 0%, #106EBE 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 4px;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0, 120, 212, 0.3);
        }
        .feature-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            margin: 24px 0;
        }
        .feature-item {
            background-color: #F3F2F1;
            padding: 20px;
            border-radius: 6px;
            border-left: 3px solid #0078D4;
        }
        .feature-item h3 {
            font-size: 16px;
            color: #323130;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .feature-item p {
            font-size: 14px;
            color: #605E5C;
            margin: 0;
        }
        .email-footer {
            background-color: #FAF9F8;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #EDEBE9;
        }
        .footer-text {
            font-size: 13px;
            color: #8A8886;
            margin-bottom: 12px;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .email-header {
                padding: 30px 20px;
            }
            .email-body {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>🎉 You're All Set!</h1>
            <p>Your email has been verified</p>
        </div>

        <div class="email-body">
            <div class="greeting">Welcome to SubSentry, ${userEmail}!</div>
            
            <p class="message">
                Your email has been successfully verified. You now have full access to all SubSentry features!
            </p>

            <div class="feature-grid">
                <div class="feature-item">
                    <h3>📊 Track All Subscriptions</h3>
                    <p>Keep all your subscriptions in one organized place with automatic renewal reminders.</p>
                </div>
                <div class="feature-item">
                    <h3>💰 Monitor Costs</h3>
                    <p>See your total monthly and yearly spending with detailed cost analytics.</p>
                </div>
                <div class="feature-item">
                    <h3>⏰ Never Miss a Renewal</h3>
                    <p>Get email reminders at 7, 3, and 1 day before your subscriptions renew.</p>
                </div>
            </div>

            <div class="cta-container">
                <a href="${dashboardLink}" class="cta-button">Go to Dashboard</a>
            </div>
        </div>

        <div class="email-footer">
            <p class="footer-text">
                © ${new Date().getFullYear()} SubSentry. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = {
    getVerificationEmailTemplate,
    getWelcomeEmailTemplate
};
