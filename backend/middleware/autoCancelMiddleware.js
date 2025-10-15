const Appointment = require('../models/Appointment');

// Middleware to automatically cancel expired pending appointments
const autoCancelExpiredAppointments = async (req, res, next) => {
  try {
    // Only run this check for appointment-related routes
    if (req.path.includes('/appointments') || req.path.includes('/calendar')) {
      // Run the auto-cancellation check
      const result = await Appointment.cancelExpiredPendingAppointments();
      
      // Log if any appointments were cancelled
      if (result.cancelled > 0) {
        console.log(`🔄 Auto-cancelled ${result.cancelled} expired pending appointments via middleware`);
        
        // Optionally send cancellation notifications (this could be moved to a queue for better performance)
        // Note: In a production environment, you might want to use a job queue for email sending
        for (const appointment of result.appointments) {
          try {
            const { sendAppointmentCancellationNotification } = require('../services/emailService');
            await sendAppointmentCancellationNotification(appointment, 'expired');
          } catch (emailError) {
            console.error(`Failed to send cancellation email for appointment ${appointment._id}:`, emailError);
          }
        }
      }
    }
    
    next();
  } catch (error) {
    // Don't block the request if auto-cancellation fails
    console.error('Error in auto-cancel middleware:', error);
    next();
  }
};

module.exports = {
  autoCancelExpiredAppointments
};
