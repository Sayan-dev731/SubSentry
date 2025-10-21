# SubSentry - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
```

**Required Settings:**
```env
MONGODB_URI=mongodb://localhost:27017/subsentry
JWT_SECRET=your-secret-key-here
GMAIL=your-email@gmail.com
APP_PASS=your-gmail-app-password
```

### 3. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Linux/macOS:**
```bash
sudo systemctl start mongod
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name subsentry-mongodb mongo
```

### 4. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 SubSentry Server Started
📍 Port: 3000
```

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"SecurePass123!\"}"
```

**Create Subscription:**
```bash
# Save the token from registration response, then:
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Netflix\",\"renewal_date\":\"2024-12-31\",\"cost\":15.99}"
```

## 📁 Project Structure
```
SubSentry/
├── src/
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, logging, errors
│   ├── utils/           # Database, email, validators
│   ├── cron/            # Scheduled tasks
│   └── index.js         # App entry point
├── docs/                # Documentation
├── .env                 # Environment config (create this)
└── package.json         # Dependencies
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)
- `PUT /api/auth/change-password` - Change password (protected)

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions (protected)
- `POST /api/subscriptions` - Create subscription (protected)
- `GET /api/subscriptions/:id` - Get specific subscription (protected)
- `PUT /api/subscriptions/:id` - Update subscription (protected)
- `DELETE /api/subscriptions/:id` - Delete subscription (protected)
- `GET /api/subscriptions/stats/summary` - Get statistics (protected)

### Utility
- `GET /health` - Server health check
- `GET /api` - API documentation

## 🔐 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token from `/api/auth/register` or `/api/auth/login` response.

## 💾 Database

**Connection String Format:**
```
mongodb://localhost:27017/subsentry
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/subsentry
```

**Collections:**
- `users` - User accounts
- `subscriptions` - User subscriptions

**Indexes:**
- `users.email` (unique)
- `subscriptions.user_id`
- `subscriptions.renewal_date`

## 📧 Email Configuration

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → App passwords
   - Create password for "Mail"
3. Use in `.env`:
   ```
   GMAIL=your-email@gmail.com
   APP_PASS=your-16-char-app-password
   ```

## ⏰ Cron Jobs

**Enabled by default** - sends subscription reminders daily at 9:00 AM.

**Disable:**
```env
CRON_ENABLED=false
```

**Schedule:**
```env
REMINDER_CRON_SCHEDULE=0 9 * * *
```

## 🧪 Testing

### Manual Testing
See `docs/API_TESTING.md` for detailed testing guide.

### Automated Test Script
```powershell
# PowerShell
.\test-api.ps1

# Or test individual endpoints
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

### Using Postman/Thunder Client
1. Import collection from examples
2. Set base URL: `http://localhost:3000`
3. Set auth token in environment variables
4. Run requests

## 📚 Documentation

- **README.md** - Full project documentation
- **docs/MONGODB_SETUP.md** - MongoDB installation guide
- **docs/API_TESTING.md** - Complete testing guide
- **docs/MIGRATION_SUMMARY.md** - Migration details
- **MIGRATION_COMPLETE.md** - Migration completion report

## ⚠️ Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process using port (Windows)
taskkill /PID <process_id> /F
```

### MongoDB connection failed
```bash
# Check MongoDB is running
net start MongoDB  # Windows
sudo systemctl status mongod  # Linux

# Verify connection string in .env
# Check MongoDB logs for errors
```

### Authentication errors
```bash
# Token expired - login again
# Check JWT_SECRET is set
# Verify token is in Authorization header
```

### Package issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚨 Common Errors

**Error: connect ECONNREFUSED**
→ MongoDB not running - start MongoDB service

**Error: Invalid token**
→ Token expired or invalid - login again

**Error: Email already registered**
→ User exists - use different email or login

**Error: Subscription not found**
→ Wrong ID or subscription belongs to another user

## 🎯 Next Steps

1. ✅ Test all endpoints
2. ✅ Create your first user
3. ✅ Add subscriptions
4. ✅ Check email reminders work
5. ✅ Review statistics endpoint
6. ✅ Set up MongoDB backups
7. ✅ Configure production environment
8. ✅ Deploy to cloud (optional)

## 📞 Support

**Documentation:**
- MongoDB: https://docs.mongodb.com/
- Mongoose: https://mongoosejs.com/docs/
- Express: https://expressjs.com/

**Community:**
- Stack Overflow
- MongoDB Community Forums
- GitHub Issues

## 🎉 You're Ready!

Your SubSentry API is now running with MongoDB. Start testing and building!

**Health Check:** http://localhost:3000/health  
**API Docs:** http://localhost:3000/api

---

**Happy Coding! 🚀**
