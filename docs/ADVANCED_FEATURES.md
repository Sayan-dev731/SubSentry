# 🚀 Advanced Features Documentation

## Overview

SubSentry has been enhanced with advanced features for a more robust subscription management system with intelligent reminders, tracking, and clean URLs.

---

## ✨ New Features

### 1. **Multi-Window Reminder System**

Instead of a single reminder, the system now sends emails at multiple intervals:

- **7 days before** renewal - Blue notification (📅)
- **3 days before** renewal - Orange warning (🔔)
- **1 day before** renewal - Yellow alert (⏰)
- **Same day** renewal - Red urgent (⚠️)

#### Benefits:
- ✅ Multiple touchpoints ensure users don't miss renewals
- ✅ Escalating urgency helps prioritize actions
- ✅ Reduces churn from forgotten subscriptions

#### Technical Implementation:
```javascript
const REMINDER_WINDOWS = [
    { days: 7, type: '7_day', name: '7 days' },
    { days: 3, type: '3_day', name: '3 days' },
    { days: 1, type: '1_day', name: '1 day' },
    { days: 0, type: 'same_day', name: 'today' }
];
```

---

### 2. **Reminder History Tracking**

New `ReminderLog` model tracks all sent emails to:

- **Prevent duplicate emails** - Won't send same reminder twice in one day
- **Track delivery status** - Records success/failure
- **Maintain audit trail** - Keep history for compliance
- **Generate analytics** - Measure email success rates

#### Database Schema:
```javascript
{
  subscription_id: ObjectId,
  user_id: ObjectId,
  reminder_type: '7_day' | '3_day' | '1_day' | 'same_day' | 'overdue',
  days_before_renewal: Number,
  sent_at: Date,
  email_status: 'sent' | 'failed' | 'bounced',
  error_message: String,
  renewal_date_at_send: Date
}
```

#### API Methods:
```javascript
// Check if reminder was sent today
await ReminderLog.wasReminderSentToday(subscriptionId, reminderType);

// Get reminder history
await ReminderLog.getHistory(subscriptionId, limit);

// Get statistics
await ReminderLog.getStats(startDate, endDate);

// Cleanup old logs
await ReminderLog.cleanup(daysToKeep);
```

---

### 3. **Batch Email Processing**

Emails are now sent in controlled batches:

- **Batch size**: 10 emails per batch
- **Delay**: 2 seconds between batches
- **Rate limiting**: Prevents server overload
- **Parallel processing**: Within each batch

#### Configuration:
```javascript
const EMAIL_BATCH_SIZE = 10;        // Emails per batch
const EMAIL_BATCH_DELAY = 2000;     // Milliseconds between batches
```

#### Benefits:
- ✅ Avoids email provider rate limits
- ✅ Prevents server resource exhaustion
- ✅ Maintains responsiveness
- ✅ Scales to thousands of subscriptions

---

### 4. **Enhanced Email Templates**

Redesigned HTML emails with:

#### Visual Enhancements:
- **Gradient headers** - Color-coded by urgency
- **Responsive design** - Perfect on all devices
- **Cost projections** - Monthly & yearly forecasts
- **Quick tips** - Actionable suggestions
- **Direct dashboard link** - One-click access

#### Urgency Levels:
| Days | Level | Color | Gradient |
|------|-------|-------|----------|
| 0 | Critical | Red | #ef4444 → #dc2626 |
| 1 | High | Yellow | #f59e0b → #d97706 |
| 3 | Medium | Blue | #0ea5e9 → #0284c7 |
| 7+ | Low | Blue | #0066FF → #0052CC |

#### Email Sections:
1. **Header** - Emoji + title + subtitle
2. **Alert Box** - Urgency-specific message
3. **Subscription Card** - Name, cost, date
4. **Cost Projections** - Monthly/yearly totals
5. **Action Button** - Link to dashboard
6. **Quick Tips** - For urgent reminders (0-3 days)
7. **Footer** - Branding + unsubscribe info

---

### 5. **Additional Cron Jobs**

Three automated jobs now running:

#### A. Reminder Job (Daily at 9:00 AM)
- Sends subscription renewal reminders
- Processes all reminder windows
- Logs all activities

#### B. Overdue Check (Daily at 10:00 AM)
- Identifies past-due subscriptions
- Flags for follow-up
- Can trigger additional actions

#### C. Cleanup Job (Weekly on Sunday at 2:00 AM)
- Removes old reminder logs (90+ days)
- Keeps database optimized
- Maintains performance

#### Schedule Configuration:
```javascript
// Reminder job
cron.schedule('0 9 * * *', ...);   // 9:00 AM daily

// Overdue check
cron.schedule('0 10 * * *', ...);  // 10:00 AM daily

// Cleanup job
cron.schedule('0 2 * * 0', ...);   // 2:00 AM on Sundays
```

---

### 6. **Clean URLs (No .html Extension)**

URLs now work without file extensions:

#### Before:
```
http://localhost:3000/dashboard.html
http://localhost:3000/subscription-form.html
```

#### After:
```
http://localhost:3000/dashboard
http://localhost:3000/subscription-form
```

#### Features:
- ✅ Automatic redirect from `.html` to clean URL (301)
- ✅ Backward compatible - old links still work
- ✅ SEO friendly
- ✅ Professional appearance

#### Technical Implementation:
```javascript
// Middleware in src/index.js
app.use((req, res, next) => {
    // Redirect .html to clean URL
    if (req.path.endsWith('.html')) {
        return res.redirect(301, req.path.slice(0, -5));
    }
    
    // Serve .html for clean URLs
    if (!req.path.includes('.') && req.path !== '/') {
        req.url = req.path + '.html';
    }
    
    next();
});
```

---

## 📊 Advanced Analytics

### Reminder Statistics

Track email performance:

```javascript
const stats = await ReminderLog.getStats('2025-01-01', '2025-01-31');

// Returns:
{
  total: 1250,           // Total reminders sent
  sent: 1235,            // Successfully sent
  failed: 15,            // Failed to send
  success_rate: '98.80'  // Success percentage
}
```

### Job Execution Metrics

Each reminder job run provides:

```javascript
{
  total_checked: 150,        // Subscriptions evaluated
  reminders_sent: 45,        // Emails successfully sent
  duplicates_skipped: 12,    // Already sent today
  failed: 2,                 // Send failures
  overdue_found: 3           // Past-due subscriptions
}
```

---

## 🔧 Configuration Options

### Environment Variables

```env
# Cron Jobs
CRON_ENABLED=true                          # Enable/disable all cron jobs

# Email Settings
EMAIL_USER=your-email@gmail.com            # Gmail address
EMAIL_PASS=your-app-password               # Gmail app password
EMAIL_HOST=smtp.gmail.com                  # SMTP host
EMAIL_PORT=587                             # SMTP port
EMAIL_FROM=SubSentry <your-email@gmail.com> # From address

# Advanced Settings (optional)
EMAIL_BATCH_SIZE=10                        # Emails per batch
EMAIL_BATCH_DELAY=2000                     # Ms between batches
LOG_RETENTION_DAYS=90                      # Days to keep logs
```

### Customizing Reminder Windows

Edit `src/cron/reminderJob.js`:

```javascript
const REMINDER_WINDOWS = [
    { days: 14, type: '14_day', name: '2 weeks' },  // Add 2-week reminder
    { days: 7, type: '7_day', name: '7 days' },
    { days: 3, type: '3_day', name: '3 days' },
    { days: 1, type: '1_day', name: '1 day' },
    { days: 0, type: 'same_day', name: 'today' }
];
```

### Customizing Cron Schedules

Edit `src/cron/index.js`:

```javascript
// Run reminders at 8:00 AM instead of 9:00 AM
cron.schedule('0 8 * * *', ...);

// Run cleanup twice a week (Sunday and Wednesday)
cron.schedule('0 2 * * 0,3', ...);

// Run overdue check every 6 hours
cron.schedule('0 */6 * * *', ...);
```

---

## 📈 Performance Optimizations

### 1. **Database Indexing**
```javascript
// Reminder logs optimized with compound indexes
reminderLogSchema.index({ subscription_id: 1, reminder_type: 1, sent_at: -1 });
reminderLogSchema.index({ subscription_id: 1 });
reminderLogSchema.index({ sent_at: -1 });
```

### 2. **Batch Processing**
- Processes 10 emails in parallel
- 2-second delay between batches
- Prevents memory spikes

### 3. **Automatic Cleanup**
- Weekly removal of old logs
- Keeps database size manageable
- Maintains query performance

### 4. **Duplicate Prevention**
- Checks before sending each reminder
- Prevents email spam
- Reduces server load

---

## 🧪 Testing Advanced Features

### Test Reminder System

1. **Create test subscription**:
```javascript
{
  name: "Test Netflix",
  cost: 15.99,
  renewal_date: "2025-10-28",  // 7 days from now
  reminder_offset_days: 7
}
```

2. **Run reminder job immediately**:
Uncomment in `src/cron/index.js`:
```javascript
console.log('🧪 Running reminder job immediately for testing...');
sendSubscriptionReminders().catch(console.error);
```

3. **Check email** for 7-day reminder

4. **Update subscription**:
```javascript
renewal_date: "2025-10-25"  // 3 days from now
```

5. **Run job again** - should send 3-day reminder

### Test Clean URLs

```bash
# Test redirects
curl -I http://localhost:3000/dashboard.html
# Should return: 301 Moved Permanently
# Location: /dashboard

# Test clean URL
curl -I http://localhost:3000/dashboard
# Should return: 200 OK
```

### Test Reminder Logs

```javascript
// In MongoDB or Compass
db.reminder_logs.find().sort({ sent_at: -1 }).limit(10);

// Or via API (if you add endpoint)
const logs = await ReminderLog.getHistory(subscriptionId);
console.log(logs);
```

---

## 🔐 Security Enhancements

### Email Security
- ✅ Uses Gmail App Passwords (not regular passwords)
- ✅ Environment variable protection
- ✅ No credentials in code

### Rate Limiting
- ✅ Batch processing prevents abuse
- ✅ Duplicate detection prevents spam
- ✅ Controlled email velocity

### Data Privacy
- ✅ Reminder logs expire after 90 days
- ✅ No sensitive data in emails
- ✅ Secure token-based dashboard access

---

## 📋 Monitoring & Logging

### Console Output

#### Reminder Job:
```
======================================================================
🕐 [2025-10-21T14:00:00.000Z] Starting daily subscription reminder job
======================================================================
🔔 Running advanced subscription reminder job...
📧 Found 45 subscription(s) to process

📬 Processing 7 day reminders (12 total)
✅ 7 days reminder sent: "Netflix" to user@example.com
...

📬 Processing 3 day reminders (8 total)
✅ 3 days reminder sent: "Spotify" to user2@example.com
...

======================================================================
📊 Reminder Job Summary:
   Total Checked: 45
   Reminders Sent: 38
   Duplicates Skipped: 5
   Failed: 2
   Overdue Found: 1
======================================================================
```

#### Overdue Check:
```
======================================================================
🕐 [2025-10-21T15:00:00.000Z] Starting overdue subscription check
======================================================================
🔍 Checking for overdue subscriptions...
✅ Overdue check completed
======================================================================
```

#### Cleanup Job:
```
======================================================================
🕐 [2025-10-21T02:00:00.000Z] Starting weekly cleanup job
======================================================================
🧹 Cleaning up old reminder logs...
✅ Cleaned up 1,247 old log entries
======================================================================
```

---

## 🎯 Use Cases

### 1. **High-Value Subscriptions**
- Set renewal_date appropriately
- Enable all reminder windows
- Gets 4 reminders (7d, 3d, 1d, 0d)

### 2. **Low-Priority Subscriptions**
- Set reminder_offset_days = 1
- Only get 1-day and same-day reminders
- Reduces email noise

### 3. **Annual Subscriptions**
- Set reminder_offset_days = 30
- Get reminders 30, 7, 3, 1, and 0 days before
- Extra lead time for annual planning

### 4. **Trial Periods**
- Set reminder_offset_days = 0
- Only get same-day reminder
- Perfect for free trial expirations

---

## 🚀 Future Enhancements

### Planned Features:
- [ ] SMS notifications via Twilio
- [ ] Push notifications
- [ ] Email open/click tracking
- [ ] User-customizable reminder preferences
- [ ] Subscription categories with different reminder rules
- [ ] Bulk subscription management
- [ ] Spending insights and analytics
- [ ] Integration with calendar apps
- [ ] Payment method validation before renewal
- [ ] Automatic subscription cancellation

---

## 📞 Support

### Common Issues

**Q: Not receiving reminder emails?**
A: Check Gmail App Password setup and `CRON_ENABLED=true`

**Q: Clean URLs not working?**
A: Restart server after implementing middleware changes

**Q: Duplicate emails being sent?**
A: Check ReminderLog is properly tracking sends

**Q: Cron jobs not running?**
A: Verify `CRON_ENABLED=true` and check console logs

### Debugging Commands

```bash
# Check if MongoDB is connected
# Look for: ✅ MongoDB connected successfully

# Check if cron jobs initialized
# Look for: ⏰ Initializing advanced cron jobs...

# Test reminder job manually
node -e "require('dotenv').config(); require('./src/utils/database').connectDB().then(() => require('./src/cron/reminderJob').sendSubscriptionReminders())"

# View reminder logs
mongo subsentry --eval "db.reminder_logs.find().pretty()"
```

---

## 📚 Additional Documentation

- [Main README](../README.md) - Project overview
- [Cron Jobs Guide](./CRON_JOBS.md) - Detailed cron setup
- [Testing Guide](./TESTING_CRON_JOB.md) - Testing instructions
- [MongoDB Setup](./MONGODB_SETUP.md) - Database configuration
- [API Documentation](./API_TESTING.md) - API endpoints

---

**Version**: 2.0.0  
**Last Updated**: October 21, 2025  
**Status**: ✅ Production Ready
