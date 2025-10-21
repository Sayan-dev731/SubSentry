const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

/**
 * Subscription Routes
 * Base path: /api/subscriptions
 * All routes require authentication
 */

// Apply authentication middleware to all subscription routes
router.use(authenticate);

/**
 * GET /api/subscriptions
 * Get all subscriptions for the authenticated user
 */
router.get('/', subscriptionController.getAllSubscriptions);

/**
 * POST /api/subscriptions
 * Create a new subscription for the authenticated user
 */
router.post('/', subscriptionController.createSubscription);

/**
 * GET /api/subscriptions/stats/summary
 * Get subscription statistics for the authenticated user
 */
router.get('/stats/summary', subscriptionController.getSubscriptionStats);

/**
 * GET /api/subscriptions/:id
 * Get a specific subscription by ID (user-scoped)
 */
router.get('/:id', subscriptionController.getSubscriptionById);

/**
 * PUT /api/subscriptions/:id
 * Update a subscription by ID (user-scoped)
 */
router.put('/:id', subscriptionController.updateSubscription);

/**
 * DELETE /api/subscriptions/:id
 * Delete a subscription by ID (user-scoped)
 */
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
