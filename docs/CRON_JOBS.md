# 📧 Email Reminder Cron Job Implementation

## Overview
Automated daily email reminders for upcoming subscription renewals using `node-cron` and `nodemailer`.

## File Structure

```
src/cron/
├── index.js        # Cron job scheduler (runs once daily)
└── reminderJob.js  # Business logic for sending reminders
```

## How It Works

### 1. **Reminder Job (`reminderJob.js`)**
- Queries subscriptions using `Subscription.findUpcomingReminders(30)` to find subscriptions due within 30 days
- For each subscription, checks if it's within the `reminder_offset_days` window
- Sends a personalized email reminder using `nodemailer`
- Includes error handling per subscription (one failure doesn't stop others)
- Logs success/failure count after each run

### 2. **Scheduler (`index.js`)**
- Uses `node-cron` to schedule the reminder job
- Runs **once per day at 9:00 AM** (configurable)
- Cron pattern: `'0 9 * * *'` (minute=0, hour=9, every day/month/weekday)
- Timezone: `America/New_York` (change in code if needed)
- Includes graceful shutdown support via `stopCronJobs()`

### 3. **Email Template**
Beautiful HTML email with:
- 🔔 Professional header with gradient design
- 📅 Subscription details card (name, cost, renewal date)
- ⚠️ Color-coded alerts (urgent for today, warning for tomorrow)
- 💳 Cost prominently displayed
- 📱 Responsive design
- Plain text fallback for email clients without HTML support

## Configuration

### Environment Variables
Make sure these are set in your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password    # Gmail App Password (not regular password)
EMAIL_FROM=SubSentry <your-email@gmail.com>

# Cron Job Control
CRON_ENABLED=true                # Set to 'false' to disable cron jobs
```

### Enable/Disable Cron Jobs
In `src/index.js`, cron jobs are only initialized if `CRON_ENABLED=true`:

```javascript
if (process.env.CRON_ENABLED === 'true') {
    initCronJobs();
    console.log('⏰ Cron jobs initialized');
}
```

### Testing Immediately
To test the reminder job on server startup (before waiting for 9 AM), uncomment these lines in `src/cron/index.js`:

```javascript
// console.log('🧪 Running reminder job immediately for testing...');
// sendSubscriptionReminders().catch(console.error);
```

## Schedule Customization

Edit the cron pattern in `src/cron/index.js`:

```javascript
// Current: Daily at 9:00 AM
const reminderJob = cron.schedule('0 9 * * *', ...);

// Examples:
// Every hour:        '0 * * * *'
// Twice daily:       '0 9,18 * * *'  (9 AM and 6 PM)
// Every Monday:      '0 9 * * 1'
// First of month:    '0 9 1 * *'
```

### Cron Pattern Format
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *
```

## Email Sending Logic

### When Emails Are Sent
1. Cron job runs at 9:00 AM daily
2. Queries all subscriptions with `renewal_date` within 30 days
3. For each subscription, checks: `daysUntilRenewal <= reminder_offset_days`
4. Only sends email if within the reminder window AND renewal date hasn't passed

### Example Scenarios

| Scenario | Today | Renewal Date | `reminder_offset_days` | Email Sent? |
|----------|-------|--------------|------------------------|-------------|
| Spotify | Jan 1 | Jan 8 | 7 | ✅ Yes (7 days away) |
| Netflix | Jan 1 | Jan 15 | 7 | ❌ No (too far away) |
| Amazon | Jan 1 | Jan 4 | 5 | ✅ Yes (3 days away) |
| Apple | Jan 1 | Jan 1 | 3 | ✅ Yes (today!) |

### Email Subject Lines
- **Today:** `⚠️ Netflix renews TODAY!`
- **Tomorrow:** `⏰ Spotify renews tomorrow`
- **Multiple days:** `🔔 Amazon Prime renews in 5 days`

## Database Model

The reminder job uses the `Subscription` model's static method:

```javascript
Subscription.findUpcomingReminders(days)
```

This returns subscriptions where:
- `renewal_date` is between today and `days` from now
- Includes populated user email via `.populate('user_id', 'email')`

## Logging

The cron job provides detailed console output:

```
============================================================
🕐 [2025-01-15T14:00:00.000Z] Starting daily subscription reminder job
============================================================
🔔 Running subscription reminder job...
📧 Found 3 subscription(s) requiring reminders
✅ Reminder sent for "Netflix" to user@example.com
✅ Reminder sent for "Spotify" to user@example.com
✅ Reminder sent for "Amazon Prime" to user@example.com
✅ Reminder job completed: 3 sent, 0 failed
============================================================
🏁 Daily reminder job completed
```

## Error Handling

### Per-Subscription Errors
If one email fails, others still send:
```javascript
for (const subscription of upcomingSubscriptions) {
    try {
        await sendReminderEmail(subscription, daysUntilRenewal);
        successCount++;
    } catch (error) {
        failCount++;
        console.error(`❌ Failed for "${subscription.name}":`, error.message);
    }
}
```

### Job-Level Errors
If the entire job fails (e.g., database connection issue):
```javascript
try {
    await sendSubscriptionReminders();
} catch (error) {
    console.error('❌ Reminder job failed:', error);
}
```

## Gmail Setup

### Generate App Password (Required)
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to **App passwords**
4. Create new app password for "Mail"
5. Use this 16-character password in `EMAIL_PASS` (not your regular password)

### Why App Password?
- Gmail blocks "less secure apps" since May 2022
- App passwords allow nodemailer to authenticate securely
- Regular passwords will be rejected

## Testing

### Manual Test
Run the reminder job immediately from Node.js REPL:

```bash
node
```

```javascript
const { sendSubscriptionReminders } = require('./src/cron/reminderJob');
sendSubscriptionReminders().then(() => console.log('Done'));
```

### Test with Real Data
1. Create a test subscription with `renewal_date` = tomorrow
2. Set `reminder_offset_days` = 1
3. Restart server or wait for 9:00 AM
4. Check logs and your email inbox

## Troubleshooting

### Cron Job Not Running
- Check `CRON_ENABLED=true` in `.env`
- Verify server logs show: `⏰ Cron jobs initialized`
- Uncomment test lines in `index.js` to run immediately

### Emails Not Sending
- Verify `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST` in `.env`
- Check Gmail App Password (not regular password)
- Look for nodemailer errors in console
- Test with: `npm run test` (if test script exists)

### No Subscriptions Found
- Verify subscriptions exist in database
- Check `renewal_date` is within 30 days
- Ensure `reminder_offset_days` covers the time window
- Review `Subscription.findUpcomingReminders()` query

### Wrong Timezone
Change timezone in `src/cron/index.js`:
```javascript
cron.schedule('0 9 * * *', async () => { ... }, {
    timezone: "America/Los_Angeles"  // Your timezone
});
```

[List of timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Future Enhancements

- [ ] Add SMS reminders via Twilio
- [ ] Support multiple reminder windows (7 days, 3 days, 1 day)
- [ ] Allow users to customize reminder preferences
- [ ] Add email open tracking
- [ ] Implement reminder history log
- [ ] Support different email templates per subscription
- [ ] Add "snooze" functionality for reminders

## Dependencies

```json
{
  "node-cron": "^4.2.1",      // Cron job scheduling
  "nodemailer": "^7.0.9"      // Email sending
}
```

---

**Created:** January 2025  
**Status:** ✅ Production Ready  
**Last Updated:** January 15, 2025
