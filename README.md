# SubSentry v2.0

A comprehensive subscription management and monitoring service built with Node.js and Express, featuring advanced multi-window email reminders and intelligent tracking.

## ✨ Features

### Core Functionality
- 🔐 User authentication with JWT
- 💳 Subscription management (CRUD operations)
-  Subscription statistics and analytics
- 🔒 Secure password hashing with bcrypt
- 🗄️ MongoDB database integration
- 🎨 **Professional static frontend** with clean, minimalist design

### Advanced Email System (New in v2.0)
- 📧 **Multi-window reminders** - 4 reminder emails per subscription (7d, 3d, 1d, 0d)
- 🎨 **Color-coded urgency** - Visual indicators based on renewal proximity
- 📝 **Reminder history tracking** - Prevents duplicate emails, maintains audit trail
- 💰 **Cost projections** - Monthly and yearly cost forecasts in emails
- 📱 **Responsive email templates** - Beautiful designs optimized for all devices
- ⚡ **Batch processing** - Intelligent rate limiting for scalability
- 📊 **Email analytics** - Track delivery rates and success metrics

### Automation & Scheduling
- ⏰ **3 automated cron jobs**:
  - Daily reminders (9:00 AM)
  - Overdue checks (10:00 AM)  
  - Weekly log cleanup (Sunday 2:00 AM)

### User Experience
- 🔗 **Clean URLs** - No `.html` extensions (e.g., `/dashboard` instead of `/dashboard.html`)
- 🚀 **Fast navigation** - Automatic redirects with proper status codes

## Tech Stack

**Backend:**
- **Framework:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt for password hashing
- **Email:** Nodemailer with Gmail
- **Scheduling:** node-cron
- **Environment:** dotenv

**Frontend:**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Responsive Design** - Mobile, tablet, desktop support

## Project Structure

```
subsentry/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   └── subscriptionController.js
│   ├── models/            # Database models
│   │   ├── User.js
│   │   ├── Subscription.js
│   │   └── ReminderLog.js        # NEW: Email tracking
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   └── subscriptionRoutes.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── utils/             # Utility functions
│   │   ├── database.js
│   │   ├── emailService.js
│   │   └── validators.js
│   ├── cron/              # Scheduled jobs
│   │   ├── index.js              # NEW: Job scheduler
│   │   └── reminderJob.js        # ENHANCED: Advanced reminders
│   └── index.js           # Application entry point (+ Clean URL middleware)
├── public/                # Static frontend
│   ├── index.html         # Login/Register page
│   ├── dashboard.html     # Main dashboard
│   ├── subscription-form.html  # Add/Edit form
│   ├── styles.css         # Global styles
│   ├── main.js            # Frontend JavaScript (Clean URLs)
│   └── README.md          # Frontend documentation
├── docs/                  # Documentation
│   ├── MONGODB_SETUP.md
│   ├── API_TESTING.md
│   ├── MIGRATION_SUMMARY.md
│   ├── CRON_JOBS.md
│   ├── ADVANCED_FEATURES.md      # NEW: v2.0 features
│   ├── UPGRADE_SUMMARY.md        # NEW: v2.0 changes
│   └── TESTING_CRON_JOB.md
├── database/              # Database scripts (deprecated)
│   ├── schema.sql
│   └── seed.sql
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SubSentry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/subsentry`)
   - `JWT_SECRET`: A secure random string for JWT signing
   - `GMAIL`: Your Gmail address
   - `APP_PASS`: Your Gmail app-specific password

4. **Set up MongoDB**
   
   See [docs/MONGODB_SETUP.md](docs/MONGODB_SETUP.md) for detailed instructions.
   
   **Quick Start (Local MongoDB):**
   ```bash
   # Install MongoDB (if not already installed)
   # See MONGODB_SETUP.md for OS-specific instructions
   
   # Start MongoDB service
   # Linux/macOS: sudo systemctl start mongod
   # Windows: net start MongoDB
   # Docker: docker run -d -p 27017:27017 --name subsentry-mongodb mongo
   ```
   
   The database and collections will be created automatically when you start the application.

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   ```
   Frontend: http://localhost:3000
   Dashboard: http://localhost:3000/dashboard (Clean URL - no .html)
   API: http://localhost:3000/api
   Health Check: http://localhost:3000/health
   ```

## 🌟 What's New in v2.0

### Multi-Window Email Reminders
Subscriptions now trigger **4 reminder emails** at strategic intervals:
- 📅 **7 days before** - Early warning (Blue)
- 🔔 **3 days before** - Get ready (Orange)
- ⏰ **1 day before** - Last chance (Yellow)  
- ⚠️ **Same day** - Urgent action (Red)

### Intelligent Features
- ✅ **Duplicate prevention** - Won't send same reminder twice
- ✅ **Batch processing** - Handles thousands of subscriptions efficiently
- ✅ **Cost projections** - Shows monthly/yearly costs in emails
- ✅ **Reminder tracking** - Complete audit trail of all sent emails
- ✅ **Clean URLs** - Professional paths without `.html` extensions

### Additional Cron Jobs
- **Overdue Check** (10:00 AM daily) - Flags past-due subscriptions
- **Log Cleanup** (2:00 AM Sundays) - Removes logs older than 90 days

See [ADVANCED_FEATURES.md](docs/ADVANCED_FEATURES.md) for complete details.

## 🎨 Using the Frontend

### Quick Start
1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" to create an account
3. Log in with your credentials
4. Add your first subscription
5. View statistics and manage subscriptions

### Features
- **Clean Dashboard** - View all subscriptions at a glance
- **Statistics Cards** - See total cost, average, and next renewal
- **Add/Edit Subscriptions** - Simple forms for managing data
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Professional UI** - Enterprise-grade design inspired by Microsoft and Webflow

For detailed frontend documentation, see [public/README.md](public/README.md)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Subscriptions
- `POST /api/subscriptions` - Create a new subscription (protected)
- `GET /api/subscriptions` - Get all user subscriptions (protected)
- `GET /api/subscriptions/:id` - Get subscription by ID (protected)
- `PUT /api/subscriptions/:id` - Update subscription (protected)
- `DELETE /api/subscriptions/:id` - Delete subscription (protected)
- `GET /api/subscriptions/stats/summary` - Get subscription statistics (protected)

### Health Check
- `GET /health` - Check API status

## Gmail Configuration

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password in your `APP_PASS` environment variable

## Cron Jobs

The application includes automated cron jobs for email reminders:

- **Subscription Reminders** (9:00 AM daily): Sends email reminders for subscriptions based on their `reminder_offset_days` setting

**Features:**
- Queries subscriptions using MongoDB with `renewal_date` within reminder window
- Sends beautiful HTML emails via nodemailer
- Per-subscription error handling (one failure doesn't stop others)
- Configurable schedule and timezone
- Detailed logging for monitoring

**Configuration:**
- Set `CRON_ENABLED=true` in `.env` to enable
- Set `CRON_ENABLED=false` to disable all cron jobs
- Configure Gmail settings (`EMAIL_USER`, `EMAIL_PASS`, etc.)

**Documentation:**
See [docs/CRON_JOBS.md](docs/CRON_JOBS.md) for detailed implementation guide, customization options, and troubleshooting.

## Development

```bash
# Install development dependencies
npm install --save-dev nodemon

# Run in development mode with auto-reload
npm run dev
```

## Security Best Practices

- Always use HTTPS in production
- Keep JWT_SECRET secure and never commit it to version control
- Use strong passwords and enable rate limiting
- Regularly update dependencies
- Use environment variables for sensitive data
- Implement proper input validation and sanitization

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.