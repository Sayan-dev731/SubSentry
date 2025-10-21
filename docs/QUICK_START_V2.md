# 🎉 SubSentry v2.0 - Quick Start Guide

## Welcome to the Advanced Features!

SubSentry has been significantly enhanced with powerful new capabilities. Here's everything you need to know to get started.

---

## 🚀 Quick Feature Overview

### 📧 Multi-Window Email Reminders

Your subscriptions now send **4 reminder emails** instead of just 1:

```
Subscription Renewal Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day -7    📅 First reminder (Blue)
          "Netflix renews in 1 week"
          
Day -3    🔔 Second reminder (Orange)
          "Netflix renews in 3 days"
          
Day -1    ⏰ Third reminder (Yellow)
          "Netflix renews tomorrow"
          
Day 0     ⚠️ Final reminder (Red)
          "Netflix renews TODAY!"
          
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 🎨 Color-Coded Urgency

Emails automatically adjust their appearance based on urgency:

| Days Left | Color | Urgency | Header Gradient |
|-----------|-------|---------|-----------------|
| 0 | 🔴 Red | Critical | Red gradient |
| 1 | 🟡 Yellow | High | Orange gradient |
| 3 | 🟠 Orange | Medium | Blue gradient |
| 7+ | 🔵 Blue | Low | Blue gradient |

### 🔗 Clean URLs

Navigate your app with professional, clean URLs:

**Old Way** ❌:
```
http://localhost:3000/dashboard.html
http://localhost:3000/subscription-form.html?id=123
```

**New Way** ✅:
```
http://localhost:3000/dashboard
http://localhost:3000/subscription-form?id=123
```

Works automatically! Old URLs redirect seamlessly.

---

## ⚡ Quick Start in 3 Steps

### Step 1: Check Server is Running
```bash
npm run dev
```

Look for these logs:
```
⏰ Initializing advanced cron jobs...
✅ Subscription reminder job scheduled: Daily at 9:00 AM
✅ Overdue check job scheduled: Daily at 10:00 AM
✅ Cleanup job scheduled: Weekly on Sunday at 2:00 AM
📊 All cron jobs initialized successfully
```

### Step 2: Create a Test Subscription

Visit: `http://localhost:3000/subscription-form`

Fill in:
- **Name**: Test Subscription
- **Cost**: 9.99
- **Renewal Date**: 7 days from today
- **Reminder Days**: 7

Click **Add Subscription**

### Step 3: Test Immediate Reminder

Edit `src/cron/index.js` and uncomment these lines:
```javascript
console.log('🧪 Running reminder job immediately for testing...');
sendSubscriptionReminders().catch(console.error);
```

Restart server:
```bash
npm run dev
```

Check your email! 📧

---

## 📊 What You'll See

### In Console:
```
======================================================================
🕐 [2025-10-21T14:00:00.000Z] Starting daily subscription reminder job
======================================================================
🔔 Running advanced subscription reminder job...
📧 Found 1 subscription(s) to process

📬 Processing 7 day reminders (1 total)
✅ 7 days reminder sent: "Test Subscription" to your@email.com

======================================================================
📊 Reminder Job Summary:
   Total Checked: 1
   Reminders Sent: 1
   Duplicates Skipped: 0
   Failed: 0
   Overdue Found: 0
======================================================================
```

### In Your Email:
```
┌─────────────────────────────────────┐
│   🔵 Subscription Reminder          │
│   Renewing in 7 Days                │
├─────────────────────────────────────┤
│                                     │
│ 📅 Upcoming Renewal                 │
│ Your subscription will renew        │
│ in 7 days.                          │
│                                     │
│ Test Subscription                   │
│ Amount: $9.99                       │
│ Renewal Date: October 28, 2025     │
│ Days Remaining: 7 days              │
│                                     │
│ 💰 Cost Projections                 │
│ Monthly: $9.99                      │
│ Yearly: $119.88                     │
│                                     │
│   [Go to Dashboard]                 │
│                                     │
│ SubSentry - Your Personal          │
│ Subscription Manager                │
└─────────────────────────────────────┘
```

---

## 🎯 Common Use Cases

### Case 1: Netflix Subscription
```javascript
{
  name: "Netflix",
  cost: 15.99,
  renewal_date: "2025-11-01",
  reminder_offset_days: 7
}
```

**Result**: Gets reminders on Oct 25, 28, 31, and Nov 1

---

### Case 2: Annual Adobe Subscription
```javascript
{
  name: "Adobe Creative Cloud",
  cost: 599.88,
  renewal_date: "2026-01-15",
  reminder_offset_days: 30
}
```

**Result**: Gets reminders 30, 7, 3, 1, and 0 days before renewal  
**Why**: The 30-day window captures it, plus all standard windows

---

### Case 3: Trial Expiration
```javascript
{
  name: "Spotify Premium Trial",
  cost: 9.99,
  renewal_date: "2025-10-25",
  reminder_offset_days: 0
}
```

**Result**: Gets reminder ONLY on the renewal day  
**Why**: Trial conversions don't need early warnings

---

## 🔧 Customization Tips

### Change Reminder Windows

Edit `src/cron/reminderJob.js`:
```javascript
const REMINDER_WINDOWS = [
    { days: 14, type: '14_day', name: '2 weeks' },  // Add 2-week
    { days: 7, type: '7_day', name: '7 days' },
    { days: 3, type: '3_day', name: '3 days' },
    { days: 1, type: '1_day', name: '1 day' },
    { days: 0, type: 'same_day', name: 'today' }
];
```

### Change Batch Size

Edit `src/cron/reminderJob.js`:
```javascript
const EMAIL_BATCH_SIZE = 20;      // Was 10
const EMAIL_BATCH_DELAY = 1000;   // Was 2000 (faster)
```

### Change Cron Schedule

Edit `src/cron/index.js`:
```javascript
// Run at 8:00 AM instead of 9:00 AM
cron.schedule('0 8 * * *', ...);

// Run twice daily (9 AM and 6 PM)
cron.schedule('0 9,18 * * *', ...);

// Run hourly
cron.schedule('0 * * * *', ...);
```

---

## 🎓 Learn More

### Essential Documentation

1. **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** 
   - Complete feature guide
   - Configuration options
   - Use cases and examples

2. **[UPGRADE_SUMMARY.md](./UPGRADE_SUMMARY.md)**
   - What changed in v2.0
   - Performance metrics
   - Migration guide (spoiler: no migration needed!)

3. **[CRON_JOBS.md](./CRON_JOBS.md)**
   - Detailed cron configuration
   - Scheduling options
   - Troubleshooting

4. **[TESTING_CRON_JOB.md](./TESTING_CRON_JOB.md)**
   - Step-by-step testing
   - Debug procedures
   - Common issues

---

## 📈 Monitoring Your System

### Check Reminder Logs

Via MongoDB:
```javascript
db.reminder_logs.find().sort({ sent_at: -1 }).limit(10).pretty()
```

### Check Statistics

```javascript
const stats = await ReminderLog.getStats('2025-10-01', '2025-10-31');
console.log(stats);
// {
//   total: 250,
//   sent: 245,
//   failed: 5,
//   success_rate: '98.00'
// }
```

### Monitor Console Logs

Every reminder run shows:
```
📊 Reminder Job Summary:
   Total Checked: 150
   Reminders Sent: 45
   Duplicates Skipped: 12
   Failed: 2
   Overdue Found: 3
```

---

## 🐛 Troubleshooting

### Not Receiving Emails?

**Check 1**: Gmail App Password set correctly?
```env
EMAIL_USER=your@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # 16-character app password
```

**Check 2**: Cron jobs enabled?
```env
CRON_ENABLED=true
```

**Check 3**: Look for errors in console
```
❌ Failed to send reminder for "Netflix": Invalid login
```

### Duplicate Emails?

Should NOT happen! Check:
1. Is `ReminderLog` model working?
2. Are logs being saved to database?
3. Check `wasReminderSentToday()` function

### Clean URLs Not Working?

**Check middleware is registered** in `src/index.js`:
```javascript
// Should be BEFORE express.static()
app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        return res.redirect(301, req.path.slice(0, -5));
    }
    // ...
});

app.use(express.static('public'));
```

---

## 🎉 Success!

You're now running SubSentry v2.0 with:
- ✅ 4-tier reminder system
- ✅ Beautiful email templates
- ✅ Duplicate prevention
- ✅ Batch processing
- ✅ Clean URLs
- ✅ 3 automated cron jobs
- ✅ Complete reminder tracking

**Need Help?** Check the docs folder for detailed guides!

---

**Version**: 2.0.0  
**Quick Start Guide**  
**Updated**: October 21, 2025
