const { mongoose } = require('../utils/database');

/**
 * Subscription Schema Definition
 * MongoDB schema for subscriptions collection
 */
const subscriptionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true
    },
    logo_id: {
        type: String,
        default: 'other',
        trim: true
    },
    website_url: {
        type: String,
        default: '',
        trim: true
    },
    renewal_date: {
        type: Date,
        required: [true, 'Renewal date is required']
    },
    cost: {
        type: Number,
        required: [true, 'Cost is required'],
        min: [0, 'Cost must be a positive number']
    },
    reminder_offset_days: {
        type: Number,
        default: 7,
        min: [0, 'Reminder offset days must be non-negative']
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'subscriptions'
});

// Create compound indexes for efficient queries
subscriptionSchema.index({ user_id: 1, renewal_date: 1 });
subscriptionSchema.index({ user_id: 1 });
subscriptionSchema.index({ renewal_date: 1 });

// Create the model
const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);

/**
 * Subscription Model
 * Handles all database operations for subscriptions collection
 * Schema: _id, user_id, name, logo_id, website_url, renewal_date, cost, reminder_offset_days, createdAt, updatedAt
 */
class Subscription {
    /**
     * Helper method to format subscription document
     * @private
     */
    static _formatSubscription(sub) {
        return {
            id: sub._id.toString(),
            _id: sub._id,
            user_id: sub.user_id.toString(),
            name: sub.name,
            logo_id: sub.logo_id || 'other',
            website_url: sub.website_url || '',
            renewal_date: sub.renewal_date,
            cost: sub.cost,
            reminder_offset_days: sub.reminder_offset_days,
            created_at: sub.createdAt,
            createdAt: sub.createdAt,
            updated_at: sub.updatedAt,
            updatedAt: sub.updatedAt
        };
    }

    /**
     * Create a new subscription
     * @param {Object} params - Subscription data
     * @param {string} params.user_id - User ID (MongoDB ObjectId as string)
     * @param {string} params.name - Subscription name
     * @param {string} [params.logo_id='other'] - Logo identifier
     * @param {string} [params.website_url=''] - Website URL
     * @param {Date|string} params.renewal_date - Next renewal date
     * @param {number} params.cost - Subscription cost
     * @param {number} [params.reminder_offset_days=7] - Days before renewal to send reminder
     * @returns {Promise<Object>} Created subscription object
     */
    static async create({ user_id, name, logo_id = 'other', website_url = '', renewal_date, cost, reminder_offset_days = 7 }) {
        try {
            // Validate user_id is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(user_id)) {
                throw new Error('Invalid user ID');
            }

            const subscription = new SubscriptionModel({
                user_id: new mongoose.Types.ObjectId(user_id),
                name,
                logo_id,
                website_url,
                renewal_date: new Date(renewal_date),
                cost,
                reminder_offset_days
            });

            await subscription.save();

            return this._formatSubscription(subscription);
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    /**
     * Find a subscription by ID
     * @param {string} id - Subscription ID (MongoDB ObjectId as string)
     * @param {string} [userId] - Optional user ID for authorization check
     * @returns {Promise<Object|null>} Subscription object or null if not found
     */
    static async findById(id, userId = null) {
        try {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return null;
            }

            const query = { _id: id };

            // If userId provided, add authorization check
            if (userId !== null) {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return null;
                }
                query.user_id = userId;
            }

            const subscription = await SubscriptionModel.findOne(query);

            if (!subscription) {
                return null;
            }

            return this._formatSubscription(subscription);
        } catch (error) {
            console.error('Error finding subscription by ID:', error);
            return null;
        }
    }

    /**
     * Find all subscriptions for a user
     * @param {string} userId - User ID (MongoDB ObjectId as string)
     * @returns {Promise<Array>} Array of subscription objects
     */
    static async findByUserId(userId) {
        try {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return [];
            }

            const subscriptions = await SubscriptionModel.find({ user_id: userId })
                .sort({ renewal_date: 1 }); // Sort by renewal_date ascending

            return subscriptions.map(sub => this._formatSubscription(sub));
        } catch (error) {
            console.error('Error finding subscriptions by user ID:', error);
            return [];
        }
    }

    /**
     * Update a subscription
     * @param {string} id - Subscription ID (MongoDB ObjectId as string)
     * @param {string} userId - User ID for authorization (MongoDB ObjectId as string)
     * @param {Object} updates - Fields to update
     * @param {string} [updates.name] - Subscription name
     * @param {Date|string} [updates.renewal_date] - Renewal date
     * @param {number} [updates.cost] - Subscription cost
     * @param {number} [updates.reminder_offset_days] - Reminder offset days
     * @returns {Promise<Object|null>} Updated subscription object or null if not found
     */
    static async update(id, userId, updates) {
        try {
            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
                return null;
            }

            const allowedFields = ['name', 'renewal_date', 'cost', 'reminder_offset_days', 'logo_id', 'website_url'];
            const updateData = {};

            // Build update object with only allowed fields
            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    if (key === 'renewal_date') {
                        updateData[key] = new Date(value);
                    } else {
                        updateData[key] = value;
                    }
                }
            }

            // If no valid fields to update, return current subscription
            if (Object.keys(updateData).length === 0) {
                return this.findById(id, userId);
            }

            const subscription = await SubscriptionModel.findOneAndUpdate(
                { _id: id, user_id: userId }, // Find by ID and user_id for authorization
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!subscription) {
                return null;
            }

            return this._formatSubscription(subscription);
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    }

    /**
     * Delete a subscription
     * @param {string} id - Subscription ID (MongoDB ObjectId as string)
     * @param {string} userId - User ID for authorization (MongoDB ObjectId as string)
     * @returns {Promise<Object|null>} Deleted subscription object or null if not found
     */
    static async delete(id, userId) {
        try {
            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
                return null;
            }

            const subscription = await SubscriptionModel.findOneAndDelete({
                _id: id,
                user_id: userId // Authorization check
            });

            if (!subscription) {
                return null;
            }

            return this._formatSubscription(subscription);
        } catch (error) {
            console.error('Error deleting subscription:', error);
            throw error;
        }
    }

    /**
     * Find upcoming subscriptions that need reminders
     * @param {number} [days=7] - Look ahead this many days
     * @returns {Promise<Array>} Array of subscriptions with user email
     */
    static async findUpcomingReminders(days = 7) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + days);

            const subscriptions = await SubscriptionModel.find({
                renewal_date: {
                    $gte: today,
                    $lte: futureDate
                }
            })
                .populate('user_id', 'email') // Populate user email
                .sort({ renewal_date: 1 });

            return subscriptions.map(sub => ({
                id: sub._id.toString(),
                _id: sub._id,
                user_id: sub.user_id._id.toString(),
                name: sub.name,
                logo_id: sub.logo_id || 'other',
                website_url: sub.website_url || '',
                renewal_date: sub.renewal_date,
                cost: sub.cost,
                reminder_offset_days: sub.reminder_offset_days,
                created_at: sub.createdAt,
                createdAt: sub.createdAt,
                updated_at: sub.updatedAt,
                updatedAt: sub.updatedAt,
                user_email: sub.user_id.email
            }));
        } catch (error) {
            console.error('Error finding upcoming reminders:', error);
            return [];
        }
    }

    /**
     * Get subscription statistics for a user
     * @param {string} userId - User ID (MongoDB ObjectId as string)
     * @returns {Promise<Object>} Statistics object
     */
    static async getStats(userId) {
        try {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return {
                    total_subscriptions: 0,
                    total_cost: 0,
                    average_cost: 0,
                    next_renewal_date: null,
                    last_renewal_date: null
                };
            }

            const subscriptions = await SubscriptionModel.find({ user_id: userId });

            if (subscriptions.length === 0) {
                return {
                    total_subscriptions: 0,
                    total_cost: 0,
                    average_cost: 0,
                    next_renewal_date: null,
                    last_renewal_date: null
                };
            }

            const totalCost = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);
            const averageCost = totalCost / subscriptions.length;

            const renewalDates = subscriptions.map(sub => sub.renewal_date).sort((a, b) => a - b);

            return {
                total_subscriptions: subscriptions.length,
                total_cost: totalCost,
                average_cost: averageCost,
                next_renewal_date: renewalDates[0],
                last_renewal_date: renewalDates[renewalDates.length - 1]
            };
        } catch (error) {
            console.error('Error getting subscription stats:', error);
            return {
                total_subscriptions: 0,
                total_cost: 0,
                average_cost: 0,
                next_renewal_date: null,
                last_renewal_date: null
            };
        }
    }

    /**
     * Find subscriptions by renewal date range
     * @param {string} userId - User ID (MongoDB ObjectId as string)
     * @param {Date|string} startDate - Start date
     * @param {Date|string} endDate - End date
     * @returns {Promise<Array>} Array of subscriptions
     */
    static async findByDateRange(userId, startDate, endDate) {
        try {
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return [];
            }

            const subscriptions = await SubscriptionModel.find({
                user_id: userId,
                renewal_date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).sort({ renewal_date: 1 });

            return subscriptions.map(sub => ({
                id: sub._id.toString(),
                _id: sub._id,
                user_id: sub.user_id.toString(),
                name: sub.name,
                logo_id: sub.logo_id || 'other',
                website_url: sub.website_url || '',
                renewal_date: sub.renewal_date,
                cost: sub.cost,
                reminder_offset_days: sub.reminder_offset_days,
                created_at: sub.createdAt,
                createdAt: sub.createdAt,
                updated_at: sub.updatedAt,
                updatedAt: sub.updatedAt
            }));
        } catch (error) {
            console.error('Error finding subscriptions by date range:', error);
            return [];
        }
    }
}

// Export both the class and the mongoose model
Subscription.Model = SubscriptionModel;

module.exports = Subscription;
