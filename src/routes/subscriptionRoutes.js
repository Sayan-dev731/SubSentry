const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

// All subscription routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', subscriptionController.createSubscription);
router.get('/', subscriptionController.getAllSubscriptions);
router.get('/:id', subscriptionController.getSubscriptionById);
router.put('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

// Additional routes
router.get('/stats/summary', subscriptionController.getSubscriptionStats);

module.exports = router;
