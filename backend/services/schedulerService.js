const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { sendAppointmentCancellationNotification } = require('./emailService');

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  // Start all scheduled jobs
  start() {
    console.log('🕐 Starting scheduler service...');
    
    // Run every 30 minutes to check for expired pending appointments
    const autoCancelJob = cron.schedule('*/30 * * * *', async () => {
      try {
        await this.cancelExpiredPendingAppointments();
      } catch (error) {
        console.error('Error in auto-cancel job:', error);
      }
    }, {
      scheduled: false, // Don't start automatically
      timezone: "UTC"
    });

    // Run every day at midnight to clean up old cancelled appointments (optional)
    const cleanupJob = cron.schedule('0 0 * * *', async () => {
      try {
        await this.cleanupOldCancelledAppointments();
      } catch (error) {
        console.error('Error in cleanup job:', error);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.push(autoCancelJob, cleanupJob);
    
    // Start the jobs
    autoCancelJob.start();
    cleanupJob.start();
    
    console.log('✅ Scheduler service started successfully');
    console.log('   - Auto-cancel expired appointments: Every 30 minutes');
    console.log('   - Cleanup old appointments: Daily at midnight');
  }

  // Stop all scheduled jobs
  stop() {
    console.log('🛑 Stopping scheduler service...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('✅ Scheduler service stopped');
  }

  // Cancel expired pending appointments
  async cancelExpiredPendingAppointments() {
    try {
      const result = await Appointment.cancelExpiredPendingAppointments();
      
      if (result.cancelled > 0) {
        console.log(`🔄 Auto-cancelled ${result.cancelled} expired pending appointments`);
        
        // Send cancellation notifications to clients
        for (const appointment of result.appointments) {
          try {
            await sendAppointmentCancellationNotification(appointment, 'expired');
          } catch (emailError) {
            console.error(`Failed to send cancellation email for appointment ${appointment._id}:`, emailError);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error cancelling expired appointments:', error);
      throw error;
    }
  }

  // Clean up old cancelled appointments (older than 30 days)
  async cleanupOldCancelledAppointments() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await Appointment.deleteMany({
        status: 'cancelled',
        updatedAt: { $lt: thirtyDaysAgo }
      });
      
      if (result.deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${result.deletedCount} old cancelled appointments`);
      }
      
      return result;
    } catch (error) {
      console.error('Error cleaning up old appointments:', error);
      throw error;
    }
  }

  // Manual trigger for testing
  async triggerAutoCancel() {
    console.log('🔧 Manually triggering auto-cancel...');
    return await this.cancelExpiredPendingAppointments();
  }
}

module.exports = new SchedulerService();
