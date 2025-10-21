# 🧪 Quick Test Guide: Email Reminder Cron Job

## Prerequisites
- Server running (`npm run dev`)
- MongoDB connected
- Gmail credentials configured in `.env`
- `CRON_ENABLED=true` in `.env`

## Method 1: Test Immediately (Recommended)

### Step 1: Enable Immediate Execution
Edit `src/cron/index.js` and uncomment these lines (around line 35):

```javascript
// Optional: Run immediately on startup for testing (comment out in production)
// Uncomment the next 3 lines if you want to test the reminder job immediately when the server starts
console.log('🧪 Running reminder job immediately for testing...');
sendSubscriptionReminders().catch(console.error);
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Watch Console Output
You should see output like:
```
🧪 Running reminder job immediately for testing...
🔔 Running subscription reminder job...
📧 Found X subscription(s) requiring reminders
✅ Reminder sent for "Netflix" to user@example.com
✅ Reminder job completed: X sent, Y failed
```

### Step 4: Check Your Email
- Go to your email inbox
- Look for email from SubSentry
- Verify HTML rendering and subscription details

## Method 2: Manual Node REPL Test

### Step 1: Open Node REPL
```bash
node
```

### Step 2: Load and Execute Function
```javascript
require('dotenv').config();
const { connectDB } = require('./src/utils/database');
const { sendSubscriptionReminders } = require('./src/cron/reminderJob');

// Connect to database first
await connectDB();

// Run the reminder job
await sendSubscriptionReminders();

// Exit
.exit
```

## Method 3: Wait for Scheduled Time

### Step 1: Check Current Schedule
The cron job is configured to run at **9:00 AM daily** (Eastern Time by default).

### Step 2: Verify Timezone
Check `src/cron/index.js` for timezone setting:
```javascript
cron.schedule('0 9 * * *', async () => { ... }, {
    timezone: "America/New_York"  // Change this to your timezone
});
```

### Step 3: Keep Server Running
Leave server running until 9:00 AM and monitor logs.

## Creating Test Data

### Option A: Via Frontend
1. Open `http://localhost:3000`
2. Register/login
3. Add a subscription:
   - **Name:** Test Subscription
   - **Cost:** 9.99
   - **Renewal Date:** Tomorrow's date
   - **Reminder Days:** 1 (will trigger tomorrow)

### Option B: Via MongoDB Compass
```javascript
// Insert test subscription
{
  "user_id": ObjectId("your-user-id-here"),
  "name": "Test Netflix",
  "cost": 15.99,
  "renewal_date": new Date("2025-01-21"),  // Tomorrow
  "reminder_offset_days": 1,
  "created_at": new Date(),
  "updated_at": new Date()
}
```

### Option C: Via API (Postman/cURL)
```bash
# 1. Login first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# 2. Copy the token from response

# 3. Create subscription
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Subscription",
    "cost": 9.99,
    "renewal_date": "2025-01-21",
    "reminder_offset_days": 1
  }'
```

## Troubleshooting

### ❌ No emails sent
**Possible causes:**
1. No subscriptions in database → Add test data
2. Subscriptions not within reminder window → Check dates
3. Gmail credentials wrong → Verify `.env` EMAIL_USER/EMAIL_PASS
4. Gmail App Password not set → Generate new App Password

**Quick fix:**
```javascript
// In reminderJob.js, temporarily log subscriptions:
console.log('Found subscriptions:', upcomingSubscriptions);
```

### ❌ "Email credentials not configured"
**Fix:** Set environment variables in `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

### ❌ "Invalid login: 534-5.7.9 Application-specific password required"
**Fix:** You're using regular Gmail password. Generate App Password:
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Create new password for "Mail"
5. Use this 16-character password in `.env`

### ❌ No subscriptions found
**Debug:**
```javascript
// Check what's in the database
const Subscription = require('./src/models/Subscription');
await connectDB();
const all = await Subscription.find();
console.log('All subscriptions:', all);
```

### ❌ Cron job not initializing
**Check:**
1. `CRON_ENABLED=true` in `.env`
2. Look for log: `⏰ Initializing cron jobs...`
3. Look for log: `✅ Subscription reminder job scheduled`

## Expected Console Output

### Successful Run:
```
============================================================
🕐 [2025-01-20T14:00:00.000Z] Starting daily subscription reminder job
============================================================
🔔 Running subscription reminder job...
📧 Found 2 subscription(s) requiring reminders
✅ Reminder sent for "Netflix" to user1@example.com
✅ Reminder sent for "Spotify" to user2@example.com
✅ Reminder job completed: 2 sent, 0 failed
============================================================
🏁 Daily reminder job completed
```

### No Subscriptions:
```
============================================================
🕐 [2025-01-20T14:00:00.000Z] Starting daily subscription reminder job
============================================================
🔔 Running subscription reminder job...
ℹ️  No subscriptions require reminders at this time
✅ Reminder job completed: 0 sent, 0 failed
============================================================
🏁 Daily reminder job completed
```

### Partial Failure:
```
============================================================
🕐 [2025-01-20T14:00:00.000Z] Starting daily subscription reminder job
============================================================
🔔 Running subscription reminder job...
📧 Found 3 subscription(s) requiring reminders
✅ Reminder sent for "Netflix" to user1@example.com
❌ Failed to send reminder for subscription "Spotify": Invalid email address
✅ Reminder sent for "Amazon Prime" to user3@example.com
✅ Reminder job completed: 2 sent, 1 failed
============================================================
🏁 Daily reminder job completed
```

## Email Appearance

### What to Expect:
- **Subject:** 
  - `⚠️ Netflix renews TODAY!` (if today)
  - `⏰ Spotify renews tomorrow` (if tomorrow)
  - `🔔 Amazon Prime renews in 5 days` (if 5+ days)

- **Header:** Blue gradient with "🔔 Subscription Reminder"

- **Alert Box:** Color-coded based on urgency
  - Red background: Renewing today
  - Yellow background: Renewing tomorrow
  - Blue background: Multiple days away

- **Subscription Card:** 
  - Subscription name
  - Cost (large, blue text)
  - Renewal date (formatted)
  - Days until renewal

- **Footer:** 
  - "This is an automated reminder from SubSentry"
  - Small print about why you're receiving it

## Performance Testing

### Test with Multiple Subscriptions
```javascript
// Create 10 test subscriptions at once
const testData = [];
for (let i = 1; i <= 10; i++) {
    testData.push({
        user_id: yourUserId,
        name: `Test Subscription ${i}`,
        cost: 9.99 + i,
        renewal_date: new Date('2025-01-21'),
        reminder_offset_days: 1
    });
}
await Subscription.insertMany(testData);
```

### Measure Execution Time
```javascript
console.time('Reminder Job');
await sendSubscriptionReminders();
console.timeEnd('Reminder Job');
```

## Cleanup After Testing

### Remove Test Data
```javascript
// Delete all test subscriptions
await Subscription.deleteMany({ name: /^Test/ });
```

### Disable Immediate Execution
Comment out these lines in `src/cron/index.js`:
```javascript
// console.log('🧪 Running reminder job immediately for testing...');
// sendSubscriptionReminders().catch(console.error);
```

### Restart Server
```bash
npm run dev
```

## Next Steps

Once testing is successful:

1. ✅ Remove test data from database
2. ✅ Comment out immediate execution in `index.js`
3. ✅ Set `CRON_ENABLED=true` in production `.env`
4. ✅ Deploy to production
5. ✅ Monitor first scheduled run at 9:00 AM
6. ✅ Set up log aggregation/monitoring
7. ✅ Configure alerting for failures

---

**Need Help?**
- Detailed documentation: [docs/CRON_JOBS.md](CRON_JOBS.md)
- Implementation summary: [docs/CRON_IMPLEMENTATION_SUMMARY.md](CRON_IMPLEMENTATION_SUMMARY.md)
- Email service code: `src/utils/emailService.js`
- Reminder job code: `src/cron/reminderJob.js`
