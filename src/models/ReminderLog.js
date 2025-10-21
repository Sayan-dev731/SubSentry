const { mongoose } = require('../utils/database');

/**
 * Reminder Log Schema
 * Tracks all sent reminder emails to prevent duplicates
 */
const reminderLogSchema = new mongoose.Schema({
    subscription_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
        index: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reminder_type: {
        type: String,
        enum: ['7_day', '3_day', '1_day', 'same_day', 'overdue'],
        required: true
    },
    days_before_renewal: {
        type: Number,
        required: true
    },
    sent_at: {
        type: Date,
        default: Date.now,
        index: true
    },
    email_status: {
        type: String,
        enum: ['sent', 'failed', 'bounced'],
        default: 'sent'
    },
    error_message: {
        type: String,
        default: null
    },
    renewal_date_at_send: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    collection: 'reminder_logs'
});

// Compound index for efficient duplicate checking
reminderLogSchema.index({ subscription_id: 1, reminder_type: 1, sent_at: -1 });

const ReminderLogModel = mongoose.model('ReminderLog', reminderLogSchema);

/**
 * Reminder Log Model
 * Handles tracking of sent reminder emails
 */
class ReminderLog {
    /**
     * Create a new reminder log entry
     */
    static async create({
        subscription_id,
        user_id,
        reminder_type,
        days_before_renewal,
        renewal_date,
        email_status = 'sent',
        error_message = null
    }) {
        try {
            const log = new ReminderLogModel({
                subscription_id,
                user_id,
                reminder_type,
                days_before_renewal,
                renewal_date_at_send: renewal_date,
                email_status,
                error_message
            });

            await log.save();
            return log;
        } catch (error) {
            console.error('Error creating reminder log:', error);
            throw error;
        }
    }

    /**
     * Check if a reminder was already sent today
     */
    static async wasReminderSentToday(subscription_id, reminder_type) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const log = await ReminderLogModel.findOne({
                subscription_id,
                reminder_type,
                sent_at: { $gte: today },
                email_status: 'sent'
            });

            return !!log;
        } catch (error) {
            console.error('Error checking reminder log:', error);
            return false;
        }
    }

    /**
     * Get reminder history for a subscription
     */
    static async getHistory(subscription_id, limit = 10) {
        try {
            const logs = await ReminderLogModel.find({ subscription_id })
                .sort({ sent_at: -1 })
                .limit(limit);

            return logs.map(log => ({
                id: log._id.toString(),
                reminder_type: log.reminder_type,
                days_before_renewal: log.days_before_renewal,
                sent_at: log.sent_at,
                email_status: log.email_status,
                error_message: log.error_message
            }));
        } catch (error) {
            console.error('Error getting reminder history:', error);
            return [];
        }
    }

    /**
     * Get statistics for sent reminders
     */
    static async getStats(startDate = null, endDate = null) {
        try {
            const query = {};

            if (startDate || endDate) {
                query.sent_at = {};
                if (startDate) query.sent_at.$gte = new Date(startDate);
                if (endDate) query.sent_at.$lte = new Date(endDate);
            }

            const total = await ReminderLogModel.countDocuments(query);
            const sent = await ReminderLogModel.countDocuments({ ...query, email_status: 'sent' });
            const failed = await ReminderLogModel.countDocuments({ ...query, email_status: 'failed' });

            return {
                total,
                sent,
                failed,
                success_rate: total > 0 ? (sent / total * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Error getting reminder stats:', error);
            return { total: 0, sent: 0, failed: 0, success_rate: 0 };
        }
    }

    /**
     * Clean up old logs (older than 90 days)
     */
    static async cleanup(daysToKeep = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await ReminderLogModel.deleteMany({
                sent_at: { $lt: cutoffDate }
            });

            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning up reminder logs:', error);
            return 0;
        }
    }
}

ReminderLog.Model = ReminderLogModel;

module.exports = ReminderLog;
