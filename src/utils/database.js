const mongoose = require('mongoose');

/**
 * MongoDB Database Connection
 * Using Mongoose ODM for MongoDB
 */

let isConnected = false;

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    if (isConnected) {
        console.log('📦 Using existing MongoDB connection');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/subsentry';

        await mongoose.connect(mongoUri, {
            // Mongoose 6+ doesn't need these options, but keeping for compatibility
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        isConnected = true;
        console.log('✅ MongoDB connected successfully');
        console.log(`📍 Database: ${mongoose.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
            isConnected = true;
        });

    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('MongoDB disconnected');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
};

/**
 * Get connection status
 * @returns {boolean}
 */
const getConnectionStatus = () => {
    return isConnected && mongoose.connection.readyState === 1;
};

module.exports = {
    connectDB,
    disconnectDB,
    getConnectionStatus,
    mongoose
};
