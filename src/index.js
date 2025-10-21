require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Import database connection
const { connectDB, disconnectDB } = require('./utils/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');

// Import cron jobs
const { initCronJobs } = require('./cron/index');

// ============================================
// Middleware Configuration
// ============================================
// Enable CORS for frontend
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Clean URL middleware - removes .html extension (only for HTML pages, not API routes)
app.use((req, res, next) => {
    // Skip middleware for API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }

    // If path ends with .html, redirect to path without .html
    if (req.path.endsWith('.html')) {
        const newPath = req.path.slice(0, -5);
        return res.redirect(301, newPath);
    }

    // If path doesn't have an extension and is not root
    // Try to serve .html version (for static HTML pages only)
    if (!req.path.includes('.') && req.path !== '/') {
        req.url = req.path + '.html';
    }

    next();
});

// Serve static files from public directory
app.use(express.static('public'));

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'SubSentry API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API v1 routes
app.use('/api/auth', authRoutes);                    // Authentication routes
app.use('/api/subscriptions', subscriptionRoutes);   // Subscription routes (protected)

// API documentation endpoint
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SubSentry API v1',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me (protected)',
                logout: 'POST /api/auth/logout (protected)',
                changePassword: 'PUT /api/auth/change-password (protected)'
            },
            subscriptions: {
                create: 'POST /api/subscriptions (protected)',
                getAll: 'GET /api/subscriptions (protected)',
                getById: 'GET /api/subscriptions/:id (protected)',
                update: 'PUT /api/subscriptions/:id (protected)',
                delete: 'DELETE /api/subscriptions/:id (protected)',
                stats: 'GET /api/subscriptions/stats/summary (protected)'
            }
        },
        documentation: 'See README.md for detailed API documentation'
    });
});

// ============================================
// Error Handling
// ============================================

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        hint: 'Visit GET /api for available endpoints'
    });
});

// Global error handling middleware - must be last
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✅ Database connection established');

        // Start Express server
        app.listen(PORT, () => {
            console.log('=====================================');
            console.log('🚀 SubSentry Server Started');
            console.log('=====================================');
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`�️  Database: MongoDB (${process.env.MONGODB_URI || 'mongodb://localhost:27017/subsentry'})`);
            console.log(`�🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/api`);
            console.log('=====================================');
            console.log('Available Routes:');
            console.log('  POST   /api/auth/register');
            console.log('  POST   /api/auth/login');
            console.log('  GET    /api/auth/me');
            console.log('  POST   /api/auth/logout');
            console.log('  PUT    /api/auth/change-password');
            console.log('  GET    /api/subscriptions');
            console.log('  POST   /api/subscriptions');
            console.log('  GET    /api/subscriptions/:id');
            console.log('  PUT    /api/subscriptions/:id');
            console.log('  DELETE /api/subscriptions/:id');
            console.log('=====================================');

            // Initialize cron jobs if enabled
            if (process.env.CRON_ENABLED === 'true') {
                initCronJobs();
                console.log('⏰ Cron jobs initialized');
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server and database connection');
    await disconnectDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server and database connection');
    await disconnectDB();
    process.exit(0);
});

module.exports = app;