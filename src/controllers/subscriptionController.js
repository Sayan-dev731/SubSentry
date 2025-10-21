const Subscription = require('../models/Subscription');

/**
 * Subscription Controller
 * Handles all subscription CRUD operations
 * All operations are scoped to the authenticated user (req.user.userId)
 */

const subscriptionController = {
    /**
     * Create a new subscription
     * POST /api/subscriptions
     * Body: { name, renewal_date, cost, reminder_offset_days, logo_id, website_url }
     * Requires authentication
     */
    createSubscription: async (req, res, next) => {
        try {
            const { name, renewal_date, cost, reminder_offset_days, logo_id, website_url } = req.body;
            const userId = req.user.userId;

            // Validate required fields
            if (!name || !renewal_date || cost === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields',
                    message: 'Name, renewal_date, and cost are required'
                });
            }

            // Validate cost is a positive number
            if (typeof cost !== 'number' || cost < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid cost',
                    message: 'Cost must be a positive number'
                });
            }

            // Validate renewal_date is a valid date
            const renewalDate = new Date(renewal_date);
            if (isNaN(renewalDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid date',
                    message: 'Renewal date must be a valid date'
                });
            }

            // Create subscription (scoped to authenticated user)
            const subscription = await Subscription.create({
                user_id: userId,
                name,
                renewal_date,
                cost,
                reminder_offset_days: reminder_offset_days || 7,
                logo_id: logo_id || 'other',
                website_url: website_url || ''
            });

            res.status(201).json({
                success: true,
                message: 'Subscription created successfully',
                data: {
                    subscription
                }
            });
        } catch (error) {
            console.error('Create subscription error:', error);
            next(error);
        }
    },

    /**
     * Get all subscriptions for the authenticated user
     * GET /api/subscriptions
     * Query params: ?sort=renewal_date (optional)
     * Requires authentication
     */
    getAllSubscriptions: async (req, res, next) => {
        try {
            const userId = req.user.userId;

            // Fetch subscriptions (automatically scoped to user)
            const subscriptions = await Subscription.findByUserId(userId);

            res.status(200).json({
                success: true,
                data: {
                    count: subscriptions.length,
                    subscriptions
                }
            });
        } catch (error) {
            console.error('Get all subscriptions error:', error);
            next(error);
        }
    },

    /**
     * Get a single subscription by ID
     * GET /api/subscriptions/:id
     * Requires authentication and ownership
     */
    getSubscriptionById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Validate ID is a number
            if (isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'Subscription ID must be a valid number'
                });
            }

            // Fetch subscription (with user authorization check)
            const subscription = await Subscription.findById(id, userId);

            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    error: 'Subscription not found',
                    message: 'The requested subscription does not exist or you do not have access to it'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    subscription
                }
            });
        } catch (error) {
            console.error('Get subscription by ID error:', error);
            next(error);
        }
    },

    /**
     * Update a subscription
     * PUT /api/subscriptions/:id
     * Body: { name?, renewal_date?, cost?, reminder_offset_days? }
     * Requires authentication and ownership
     */
    updateSubscription: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const updates = req.body;

            // Validate ID is a number
            if (isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'Subscription ID must be a valid number'
                });
            }

            // Validate updates object is not empty
            if (!updates || Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No updates provided',
                    message: 'Please provide at least one field to update'
                });
            }

            // Validate cost if provided
            if (updates.cost !== undefined) {
                if (typeof updates.cost !== 'number' || updates.cost < 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid cost',
                        message: 'Cost must be a positive number'
                    });
                }
            }

            // Validate renewal_date if provided
            if (updates.renewal_date) {
                const renewalDate = new Date(updates.renewal_date);
                if (isNaN(renewalDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid date',
                        message: 'Renewal date must be a valid date'
                    });
                }
            }

            // Update subscription (with user authorization check)
            const subscription = await Subscription.update(id, userId, updates);

            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    error: 'Subscription not found',
                    message: 'The requested subscription does not exist or you do not have access to it'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Subscription updated successfully',
                data: {
                    subscription
                }
            });
        } catch (error) {
            console.error('Update subscription error:', error);
            next(error);
        }
    },

    /**
     * Delete a subscription
     * DELETE /api/subscriptions/:id
     * Requires authentication and ownership
     */
    deleteSubscription: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Validate ID is a number
            if (isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID',
                    message: 'Subscription ID must be a valid number'
                });
            }

            // Delete subscription (with user authorization check)
            const deleted = await Subscription.delete(id, userId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Subscription not found',
                    message: 'The requested subscription does not exist or you do not have access to it'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Subscription deleted successfully',
                data: {
                    deleted_subscription: deleted
                }
            });
        } catch (error) {
            console.error('Delete subscription error:', error);
            next(error);
        }
    },

    /**
     * Get subscription statistics for the authenticated user
     * GET /api/subscriptions/stats
     * Requires authentication
     */
    getSubscriptionStats: async (req, res, next) => {
        try {
            const userId = req.user.userId;

            // Get stats (scoped to user)
            const stats = await Subscription.getStats(userId);

            res.status(200).json({
                success: true,
                data: {
                    stats
                }
            });
        } catch (error) {
            console.error('Get subscription stats error:', error);
            next(error);
        }
    }
};

module.exports = subscriptionController;
