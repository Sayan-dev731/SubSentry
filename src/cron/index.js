const cron = require('node-cron');
const { sendSubscriptionReminders, checkOverdueSubscriptions, cleanupOldLogs } = require('./reminderJob');

/**
 * Initialize all cron jobs
 * Call this function when the app starts (after database connection)
 */
function initCronJobs() {
    console.log('⏰ Initializing advanced cron jobs...');

    // Main reminder job - runs daily at 9:00 AM
    const reminderJob = cron.schedule('0 9 * * *', async () => {
        const timestamp = new Date().toISOString();
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🕐 [${timestamp}] Starting daily subscription reminder job`);
        console.log('='.repeat(70));

        try {
            const stats = await sendSubscriptionReminders();
            console.log(`\n✅ Reminder job completed successfully`);
        } catch (error) {
            console.error('❌ Reminder job failed:', error);
        }

        console.log('='.repeat(70));
        console.log('🏁 Daily reminder job completed\n');
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });

    // Overdue check job - runs daily at 10:00 AM
    const overdueJob = cron.schedule('0 10 * * *', async () => {
        const timestamp = new Date().toISOString();
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🕐 [${timestamp}] Starting overdue subscription check`);
        console.log('='.repeat(70));

        try {
            await checkOverdueSubscriptions();
        } catch (error) {
            console.error('❌ Overdue check failed:', error);
        }

        console.log('='.repeat(70));
        console.log('🏁 Overdue check completed\n');
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });

    // Cleanup job - runs weekly on Sunday at 2:00 AM
    const cleanupJob = cron.schedule('0 2 * * 0', async () => {
        const timestamp = new Date().toISOString();
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🕐 [${timestamp}] Starting weekly cleanup job`);
        console.log('='.repeat(70));

        try {
            await cleanupOldLogs();
        } catch (error) {
            console.error('❌ Cleanup job failed:', error);
        }

        console.log('='.repeat(70));
        console.log('🏁 Weekly cleanup completed\n');
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });

    console.log('✅ Subscription reminder job scheduled: Daily at 9:00 AM');
    console.log('✅ Overdue check job scheduled: Daily at 10:00 AM');
    console.log('✅ Cleanup job scheduled: Weekly on Sunday at 2:00 AM');
    console.log('📊 All cron jobs initialized successfully\n');

    // Optional: Run immediately on startup for testing (comment out in production)
    // Uncomment the next lines to test the reminder job immediately when the server starts
    // console.log('🧪 Running reminder job immediately for testing...');
    // sendSubscriptionReminders().catch(console.error);

    return {
        reminderJob,
        overdueJob,
        cleanupJob
    };
}

/**
 * Stop all running cron jobs
 * Useful for graceful shutdown
 */
function stopCronJobs(jobs) {
    console.log('⏸️  Stopping all cron jobs...');

    if (jobs) {
        if (jobs.reminderJob) {
            jobs.reminderJob.stop();
            console.log('✅ Reminder job stopped');
        }
        if (jobs.overdueJob) {
            jobs.overdueJob.stop();
            console.log('✅ Overdue job stopped');
        }
        if (jobs.cleanupJob) {
            jobs.cleanupJob.stop();
            console.log('✅ Cleanup job stopped');
        }
    }

    console.log('✅ All cron jobs stopped successfully');
}

module.exports = {
    initCronJobs,
    stopCronJobs
};
