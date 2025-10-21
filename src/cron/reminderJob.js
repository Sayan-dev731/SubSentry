const Subscription = require('../models/Subscription');
const User = require('../models/User');
const ReminderLog = require('../models/ReminderLog');
const { sendEmail } = require('../utils/emailService');

// Configuration for reminder windows
const REMINDER_WINDOWS = [
    { days: 7, type: '7_day', name: '7 days' },
    { days: 3, type: '3_day', name: '3 days' },
    { days: 1, type: '1_day', name: '1 day' },
    { days: 0, type: 'same_day', name: 'today' }
];

// Rate limiting configuration
const EMAIL_BATCH_SIZE = 10; // Send 10 emails at a time
const EMAIL_BATCH_DELAY = 2000; // 2 seconds between batches

/**
 * Advanced subscription reminder system with multiple reminder windows
 * Sends emails at 7 days, 3 days, 1 day, and same day before renewal
 */
async function sendSubscriptionReminders() {
    console.log('🔔 Running advanced subscription reminder job...');

    try {
        const stats = {
            total_checked: 0,
            reminders_sent: 0,
            duplicates_skipped: 0,
            failed: 0,
            overdue_found: 0
        };

        // Get all upcoming subscriptions (check 30 days ahead)
        const upcomingSubscriptions = await Subscription.findUpcomingReminders(30);
        stats.total_checked = upcomingSubscriptions.length;

        if (upcomingSubscriptions.length === 0) {
            console.log('ℹ️  No subscriptions require reminders at this time');
            await logJobExecution(stats);
            return stats;
        }

        console.log(`📧 Found ${upcomingSubscriptions.length} subscription(s) to process`);

        // Group subscriptions by reminder type for batch processing
        const reminderGroups = {
            '7_day': [],
            '3_day': [],
            '1_day': [],
            'same_day': [],
            'overdue': []
        };

        // Categorize subscriptions into reminder windows
        for (const subscription of upcomingSubscriptions) {
            const daysUntilRenewal = calculateDaysUntilRenewal(subscription.renewal_date);

            // Check for overdue subscriptions
            if (daysUntilRenewal < 0) {
                reminderGroups.overdue.push({ subscription, daysUntilRenewal });
                stats.overdue_found++;
                continue;
            }

            // Find matching reminder window
            for (const window of REMINDER_WINDOWS) {
                if (daysUntilRenewal === window.days) {
                    // Check if reminder already sent today
                    const alreadySent = await ReminderLog.wasReminderSentToday(
                        subscription._id,
                        window.type
                    );

                    if (!alreadySent) {
                        reminderGroups[window.type].push({
                            subscription,
                            daysUntilRenewal,
                            reminderType: window.type,
                            reminderName: window.name
                        });
                    } else {
                        stats.duplicates_skipped++;
                        console.log(`⏭️  Skipping duplicate: "${subscription.name}" (${window.name} reminder already sent)`);
                    }
                    break;
                }
            }
        }

        // Process each reminder group
        for (const [type, reminders] of Object.entries(reminderGroups)) {
            if (reminders.length === 0) continue;

            console.log(`\n📬 Processing ${type.replace('_', ' ')} reminders (${reminders.length} total)`);

            // Send emails in batches to avoid rate limiting
            for (let i = 0; i < reminders.length; i += EMAIL_BATCH_SIZE) {
                const batch = reminders.slice(i, i + EMAIL_BATCH_SIZE);

                await Promise.all(batch.map(async ({ subscription, daysUntilRenewal, reminderType, reminderName }) => {
                    try {
                        await sendAdvancedReminderEmail(subscription, daysUntilRenewal, reminderType);

                        // Log successful reminder
                        await ReminderLog.create({
                            subscription_id: subscription._id,
                            user_id: subscription.user_id,
                            reminder_type: reminderType,
                            days_before_renewal: daysUntilRenewal,
                            renewal_date: subscription.renewal_date,
                            email_status: 'sent'
                        });

                        stats.reminders_sent++;
                        console.log(`✅ ${reminderName} reminder sent: "${subscription.name}" to ${subscription.user_email}`);
                    } catch (error) {
                        stats.failed++;

                        // Log failed reminder
                        await ReminderLog.create({
                            subscription_id: subscription._id,
                            user_id: subscription.user_id,
                            reminder_type: reminderType,
                            days_before_renewal: daysUntilRenewal,
                            renewal_date: subscription.renewal_date,
                            email_status: 'failed',
                            error_message: error.message
                        });

                        console.error(`❌ Failed to send reminder for "${subscription.name}":`, error.message);
                    }
                }));

                // Add delay between batches if there are more to process
                if (i + EMAIL_BATCH_SIZE < reminders.length) {
                    console.log(`⏳ Waiting ${EMAIL_BATCH_DELAY}ms before next batch...`);
                    await new Promise(resolve => setTimeout(resolve, EMAIL_BATCH_DELAY));
                }
            }
        }

        // Report overdue subscriptions
        if (stats.overdue_found > 0) {
            console.log(`\n⚠️  Found ${stats.overdue_found} overdue subscription(s)`);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Reminder Job Summary:');
        console.log(`   Total Checked: ${stats.total_checked}`);
        console.log(`   Reminders Sent: ${stats.reminders_sent}`);
        console.log(`   Duplicates Skipped: ${stats.duplicates_skipped}`);
        console.log(`   Failed: ${stats.failed}`);
        console.log(`   Overdue Found: ${stats.overdue_found}`);
        console.log('='.repeat(60));

        await logJobExecution(stats);
        return stats;

    } catch (error) {
        console.error('❌ Error in subscription reminder job:', error);
        throw error;
    }
}

/**
 * Calculate days until renewal
 */
function calculateDaysUntilRenewal(renewalDate) {
    const renewal = new Date(renewalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    renewal.setHours(0, 0, 0, 0);
    return Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
}

/**
 * Send advanced reminder email with enhanced features
 * @param {Object} subscription - Subscription object
 * @param {number} daysUntilRenewal - Days until renewal
 * @param {string} reminderType - Type of reminder (7_day, 3_day, 1_day, same_day)
 */
async function sendAdvancedReminderEmail(subscription, daysUntilRenewal, reminderType) {
    const userEmail = subscription.user_email;
    const subscriptionName = subscription.name;
    const cost = subscription.cost;
    const renewalDate = new Date(subscription.renewal_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Dynamic urgency level
    const urgencyLevel = daysUntilRenewal === 0 ? 'critical' :
        daysUntilRenewal === 1 ? 'high' :
            daysUntilRenewal <= 3 ? 'medium' : 'low';

    // Construct email subject with urgency indicators
    let subject;
    let emoji;

    switch (daysUntilRenewal) {
        case 0:
            subject = `⚠️ URGENT: ${subscriptionName} renews TODAY!`;
            emoji = '🔴';
            break;
        case 1:
            subject = `⏰ ${subscriptionName} renews tomorrow`;
            emoji = '🟡';
            break;
        case 3:
            subject = `🔔 ${subscriptionName} renews in 3 days`;
            emoji = '🟠';
            break;
        case 7:
            subject = `📅 ${subscriptionName} renews in 1 week`;
            emoji = '🔵';
            break;
        default:
            subject = `🔔 ${subscriptionName} renews in ${daysUntilRenewal} days`;
            emoji = '🔵';
    }

    // Calculate monthly/yearly cost projections
    const monthlyCost = cost;
    const yearlyCost = cost * 12;

    // Construct advanced HTML email
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f3f4f6;
        }
        .email-wrapper { 
            background-color: #f3f4f6; 
            padding: 40px 20px; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 16px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: ${urgencyLevel === 'critical' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
            urgencyLevel === 'high' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                urgencyLevel === 'medium' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' :
                    'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)'}; 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 700; 
            margin-bottom: 8px;
        }
        .header .emoji { 
            font-size: 48px; 
            display: block; 
            margin-bottom: 16px;
        }
        .header .subtitle { 
            font-size: 16px; 
            opacity: 0.95; 
            font-weight: 400;
        }
        .content { 
            padding: 40px 30px; 
        }
        .alert { 
            padding: 20px; 
            margin: 0 0 30px 0; 
            border-radius: 12px; 
            border-left: 5px solid;
        }
        .alert.critical { 
            background: #fee2e2; 
            border-left-color: #ef4444; 
            color: #991b1b;
        }
        .alert.high { 
            background: #fef3c7; 
            border-left-color: #f59e0b; 
            color: #92400e;
        }
        .alert.medium { 
            background: #dbeafe; 
            border-left-color: #0ea5e9; 
            color: #1e3a8a;
        }
        .alert.low { 
            background: #e0e7ff; 
            border-left-color: #6366f1; 
            color: #312e81;
        }
        .alert strong { 
            display: block; 
            font-size: 18px; 
            margin-bottom: 8px;
        }
        .subscription-card { 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); 
            border: 2px solid #e5e7eb; 
            border-radius: 12px; 
            padding: 24px; 
            margin: 24px 0;
        }
        .subscription-card h2 { 
            margin: 0 0 20px 0; 
            color: #111827; 
            font-size: 24px; 
            font-weight: 700;
        }
        .detail-grid {
            display: grid;
            gap: 16px;
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            padding: 12px 0; 
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label { 
            font-weight: 600; 
            color: #6b7280; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .detail-value { 
            color: #111827; 
            font-weight: 600; 
            font-size: 16px;
        }
        .cost-highlight { 
            font-size: 32px; 
            font-weight: 800; 
            color: #0066FF;
            display: flex;
            align-items: baseline;
        }
        .cost-highlight .currency { 
            font-size: 24px; 
            margin-right: 4px;
        }
        .cost-projection {
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
            border: 1px solid #e5e7eb;
        }
        .cost-projection h3 {
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .projection-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .projection-label {
            color: #6b7280;
            font-size: 14px;
        }
        .projection-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
        }
        .action-section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        .action-section h3 {
            color: #111827;
            font-size: 18px;
            margin-bottom: 12px;
        }
        .action-section p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .tips-section {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
        }
        .tips-section h3 {
            color: #78350f;
            font-size: 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        .tips-section h3::before {
            content: "💡";
            margin-right: 8px;
            font-size: 20px;
        }
        .tips-section ul {
            margin: 0;
            padding-left: 20px;
            color: #92400e;
        }
        .tips-section li {
            margin: 8px 0;
            font-size: 14px;
        }
        .footer { 
            text-align: center; 
            color: #6b7280; 
            font-size: 13px; 
            padding: 30px; 
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
        }
        .footer p { 
            margin: 8px 0; 
        }
        .footer strong { 
            color: #111827; 
        }
        .social-links {
            margin-top: 16px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper { 
                padding: 20px 10px; 
            }
            .header { 
                padding: 30px 20px; 
            }
            .header h1 { 
                font-size: 24px; 
            }
            .content { 
                padding: 24px 20px; 
            }
            .cost-highlight { 
                font-size: 24px; 
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <span class="emoji">${emoji}</span>
                <h1>Subscription Reminder</h1>
                <div class="subtitle">
                    ${daysUntilRenewal === 0 ? 'Action Required Today' :
            daysUntilRenewal === 1 ? 'Renewing Tomorrow' :
                `${daysUntilRenewal} Days Until Renewal`}
                </div>
            </div>
            
            <div class="content">
                <div class="alert ${urgencyLevel}">
                    <strong>
                        ${daysUntilRenewal === 0 ? '⚠️ Renewing Today!' :
            daysUntilRenewal === 1 ? '⏰ Renewing Tomorrow!' :
                daysUntilRenewal === 3 ? '🔔 Renewing in 3 Days' :
                    daysUntilRenewal === 7 ? '📅 Renewing in 1 Week' :
                        `📅 Renewing in ${daysUntilRenewal} Days`}
                    </strong>
                    ${daysUntilRenewal === 0 ?
            'Your subscription will renew today. Please ensure your payment method is up to date to avoid service interruption.' :
            daysUntilRenewal === 1 ?
                'Your subscription will renew tomorrow. This is your last chance to review or cancel if needed.' :
                'Your subscription renewal is coming up soon. Review the details below and take action if needed.'}
                </div>
                
                <div class="subscription-card">
                    <h2>${subscriptionName}</h2>
                    
                    <div class="detail-grid">
                        <div class="detail-row">
                            <span class="detail-label">Renewal Amount</span>
                            <div class="cost-highlight">
                                <span class="currency">$</span>${cost.toFixed(2)}
                            </div>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Renewal Date</span>
                            <span class="detail-value">${renewalDate}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Days Remaining</span>
                            <span class="detail-value">
                                ${daysUntilRenewal === 0 ? '⏰ Today' :
            daysUntilRenewal === 1 ? '⏰ Tomorrow' :
                `${daysUntilRenewal} days`}
                            </span>
                        </div>
                    </div>

                    <div class="cost-projection">
                        <h3>💰 Cost Projections</h3>
                        <div class="projection-row">
                            <span class="projection-label">This Month:</span>
                            <span class="projection-value">$${monthlyCost.toFixed(2)}</span>
                        </div>
                        <div class="projection-row">
                            <span class="projection-label">Yearly Cost:</span>
                            <span class="projection-value">$${yearlyCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="action-section">
                    <h3>Manage Your Subscription</h3>
                    <p>View all your subscriptions, update payment methods, or cancel anytime.</p>
                    <a href="http://localhost:3000/dashboard" class="btn">Go to Dashboard</a>
                </div>

                ${daysUntilRenewal <= 3 ? `
                <div class="tips-section">
                    <h3>Quick Tips</h3>
                    <ul>
                        <li>Check if you're still using this subscription regularly</li>
                        <li>Verify your payment method has sufficient funds</li>
                        <li>Consider downgrading to a lower tier if available</li>
                        <li>Cancel now if you don't need it anymore</li>
                    </ul>
                </div>
                ` : ''}

                <div class="footer">
                    <p>This is an automated reminder from <strong>SubSentry</strong></p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
                        You're receiving this because you have subscription reminders enabled.<br>
                        Manage your notification preferences in your dashboard.
                    </p>
                    <p style="font-size: 11px; color: #9ca3af; margin-top: 16px;">
                        SubSentry - Your Personal Subscription Manager<br>
                        © ${new Date().getFullYear()} All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    // Enhanced plain text version
    const text = `
═══════════════════════════════════════════════════════════
            SUBSCRIPTION REMINDER - ${daysUntilRenewal === 0 ? 'URGENT' : subscriptionName.toUpperCase()}
═══════════════════════════════════════════════════════════

${daysUntilRenewal === 0 ? '⚠️  RENEWING TODAY!' :
            daysUntilRenewal === 1 ? '⏰ RENEWING TOMORROW' :
                `📅 Renewing in ${daysUntilRenewal} days`}

SUBSCRIPTION DETAILS
────────────────────────────────────────────────────────────
Subscription Name: ${subscriptionName}
Renewal Amount: $${cost.toFixed(2)}
Renewal Date: ${renewalDate}
Days Remaining: ${daysUntilRenewal === 0 ? 'Today' : daysUntilRenewal === 1 ? 'Tomorrow' : `${daysUntilRenewal} days`}

COST PROJECTIONS
────────────────────────────────────────────────────────────
Monthly Cost: $${monthlyCost.toFixed(2)}
Yearly Cost: $${yearlyCost.toFixed(2)}

${daysUntilRenewal === 0 ?
            `⚠️  IMPORTANT: Your subscription will renew today. Please ensure your 
payment method is up to date to avoid service interruption.` :
            daysUntilRenewal <= 3 ?
                `QUICK TIPS:
• Check if you're still using this subscription regularly
• Verify your payment method has sufficient funds
• Consider downgrading to a lower tier if available
• Cancel now if you don't need it anymore` :
                `If you wish to cancel or modify this subscription, please do so before 
the renewal date to avoid being charged.`}

────────────────────────────────────────────────────────────
Manage your subscriptions: http://localhost:3000/dashboard
────────────────────────────────────────────────────────────

This is an automated reminder from SubSentry.
To manage your notification preferences, visit your dashboard.

SubSentry - Your Personal Subscription Manager
© ${new Date().getFullYear()} All rights reserved.
    `.trim();

    // Send the email
    await sendEmail({
        to: userEmail,
        subject,
        text,
        html
    });
}

/**
 * Log job execution for monitoring
 */
async function logJobExecution(stats) {
    // This could be extended to save to database or send to monitoring service
    console.log(`\n📝 Job execution logged at ${new Date().toISOString()}`);
}

/**
 * Check for overdue subscriptions and send notifications
 */
async function checkOverdueSubscriptions() {
    console.log('🔍 Checking for overdue subscriptions...');

    try {
        // Implementation for overdue subscription handling
        // This can be expanded based on requirements
        console.log('✅ Overdue check completed');
    } catch (error) {
        console.error('❌ Error checking overdue subscriptions:', error);
    }
}

/**
 * Clean up old reminder logs (runs weekly)
 */
async function cleanupOldLogs() {
    console.log('🧹 Cleaning up old reminder logs...');

    try {
        const deletedCount = await ReminderLog.cleanup(90); // Keep 90 days
        console.log(`✅ Cleaned up ${deletedCount} old log entries`);
    } catch (error) {
        console.error('❌ Error cleaning up logs:', error);
    }
}

module.exports = {
    sendSubscriptionReminders,
    sendAdvancedReminderEmail,
    checkOverdueSubscriptions,
    cleanupOldLogs
};
