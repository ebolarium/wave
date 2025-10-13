const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email helper
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email Templates
const emailTemplates = {
  // Visitor: Appointment request confirmation
  visitorRequestConfirmation: (appointment, professional) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .status-badge { display: inline-block; background: #ffa500; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Appointment Request Received!</h1>
          </div>
          <div class="content">
            <p>Dear ${appointment.clientName} ${appointment.clientSurname},</p>
            
            <p>Thank you for booking an appointment with <strong>${professional.firstName} ${professional.lastName}</strong>.</p>
            
            <div class="appointment-details">
              <h3>Appointment Details</h3>
              <div class="detail-row"><span class="label">Date:</span> ${appointmentDate}</div>
              <div class="detail-row"><span class="label">Time:</span> ${appointment.startTime} - ${appointment.endTime}</div>
              <div class="detail-row"><span class="label">Professional:</span> ${professional.firstName} ${professional.lastName}</div>
              <div class="detail-row"><span class="label">Status:</span> <span class="status-badge">⏳ Pending Approval</span></div>
            </div>

            <p><strong>What's Next?</strong></p>
            <p>Your appointment request is currently pending approval. You will receive a confirmation email once ${professional.firstName} approves your appointment.</p>

            <p>If you have any questions, please don't hesitate to contact us.</p>

            <div class="footer">
              <p>Energy Waves Calendar System</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Owner: New appointment request notification
  ownerNewRequest: (appointment, confirmUrl, declineUrl) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa500; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #ffa500; }
          .button-container { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 30px; margin: 0 10px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .btn-approve { background: #10b981; color: white; }
          .btn-decline { background: #ff6b6b; color: white; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Appointment Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            
            <p>You have received a new appointment request.</p>
            
            <div class="appointment-details">
              <h3>Appointment Details</h3>
              <div class="detail-row"><span class="label">Client:</span> ${appointment.clientName} ${appointment.clientSurname}</div>
              <div class="detail-row"><span class="label">Email:</span> ${appointment.clientEmail}</div>
              <div class="detail-row"><span class="label">Phone:</span> ${appointment.clientPhone}</div>
              <div class="detail-row"><span class="label">Date:</span> ${appointmentDate}</div>
              <div class="detail-row"><span class="label">Time:</span> ${appointment.startTime} - ${appointment.endTime}</div>
              ${appointment.notes ? `<div class="detail-row"><span class="label">Notes:</span> ${appointment.notes}</div>` : ''}
            </div>

            <p><strong>Please review and respond to this request:</strong></p>

            <div class="button-container">
              <a href="${confirmUrl}" class="btn btn-approve">✓ Approve Appointment</a>
              <a href="${declineUrl}" class="btn btn-decline">✕ Decline Appointment</a>
            </div>

            <p style="color: #666; font-size: 14px;">Or manage this appointment from your dashboard.</p>

            <div class="footer">
              <p>Energy Waves Calendar System</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Visitor: Appointment approved notification
  visitorApprovalConfirmation: (appointment, professional, cancelUrl) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #10b981; }
          .status-badge { display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin: 10px 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .btn-cancel { display: inline-block; padding: 12px 30px; background: #ff6b6b; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Appointment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${appointment.clientName} ${appointment.clientSurname},</p>
            
            <p>Great news! Your appointment with <strong>${professional.firstName} ${professional.lastName}</strong> has been confirmed.</p>
            
            <div class="appointment-details">
              <h3>Confirmed Appointment</h3>
              <div class="detail-row"><span class="label">Date:</span> ${appointmentDate}</div>
              <div class="detail-row"><span class="label">Time:</span> ${appointment.startTime} - ${appointment.endTime}</div>
              <div class="detail-row"><span class="label">Professional:</span> ${professional.firstName} ${professional.lastName}</div>
              <div class="detail-row"><span class="label">Status:</span> <span class="status-badge">✓ Confirmed</span></div>
            </div>

            <p><strong>Important:</strong> Please arrive on time for your appointment.</p>

            <p>If you need to cancel this appointment, please use the button below:</p>

            <div class="button-container">
              <a href="${cancelUrl}" class="btn-cancel">Cancel Appointment</a>
            </div>

            <p style="color: #666; font-size: 14px;">We recommend canceling at least 24 hours in advance.</p>

            <div class="footer">
              <p>Energy Waves Calendar System</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Visitor: Appointment declined notification
  visitorDeclineNotification: (appointment, professional) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #ff6b6b; }
          .button-container { text-align: center; margin: 30px 0; }
          .btn-book { display: inline-block; padding: 12px 30px; background: #667eea; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Not Available</h1>
          </div>
          <div class="content">
            <p>Dear ${appointment.clientName} ${appointment.clientSurname},</p>
            
            <p>We regret to inform you that your appointment request with <strong>${professional.firstName} ${professional.lastName}</strong> could not be confirmed.</p>
            
            <div class="appointment-details">
              <h3>Requested Appointment</h3>
              <div class="detail-row"><span class="label">Date:</span> ${appointmentDate}</div>
              <div class="detail-row"><span class="label">Time:</span> ${appointment.startTime} - ${appointment.endTime}</div>
            </div>

            <p>The requested time slot may no longer be available. We apologize for any inconvenience.</p>

            <p>Please feel free to book another appointment at a different time:</p>

            <div class="button-container">
              <a href="${process.env.APP_URL}/calendar" class="btn-book">Book Another Appointment</a>
            </div>

            <div class="footer">
              <p>Energy Waves Calendar System</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Owner: Appointment cancelled by visitor notification
  ownerCancellationNotification: (appointment) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #ff6b6b; }
          .button-container { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Appointment Cancelled</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            
            <p>The following appointment has been cancelled by the client:</p>
            
            <div class="appointment-details">
              <h3>Cancelled Appointment</h3>
              <div class="detail-row"><span class="label">Client:</span> ${appointment.clientName} ${appointment.clientSurname}</div>
              <div class="detail-row"><span class="label">Email:</span> ${appointment.clientEmail}</div>
              <div class="detail-row"><span class="label">Phone:</span> ${appointment.clientPhone}</div>
              <div class="detail-row"><span class="label">Date:</span> ${appointmentDate}</div>
              <div class="detail-row"><span class="label">Time:</span> ${appointment.startTime} - ${appointment.endTime}</div>
            </div>

            <p>This time slot is now available for new bookings.</p>

            <div class="button-container">
              <a href="${process.env.APP_URL}/dashboard" class="btn">Go to Dashboard</a>
            </div>

            <div class="footer">
              <p>Energy Waves Calendar System</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Visitor: Appointment cancelled confirmation
  visitorCancellationConfirmation: (appointment, professional) => {
    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${appointment.clientName} ${appointment.clientSurname},</p>
            
            <p>Your appointment with <strong>${professional.firstName} ${professional.lastName}</strong> has been successfully cancelled.</p>
            
            <div class="appointment-details">
              <h3>Cancelled Appointment</h3>
              <div class="detail-row"><span class="label">Date:</span> ${appointmentDate}</div>
              <div class="detail-row"><span class="label">Time:</span> ${appointment.startTime} - ${appointment.endTime}</div>
            </div>

            <p>We hope to see you again soon!</p>

            <div class="footer">
              <p>Energy Waves Calendar System</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

// Send visitor appointment request confirmation
const sendVisitorRequestConfirmation = async (appointment, professional) => {
  const subject = 'Appointment Request Received - Pending Approval';
  const html = emailTemplates.visitorRequestConfirmation(appointment, professional);
  return await sendEmail(appointment.clientEmail, subject, html);
};

// Send owner new appointment notification
const sendOwnerNewRequestNotification = async (appointment, ownerEmail, confirmUrl, declineUrl) => {
  const subject = `🔔 New Appointment Request - ${appointment.clientName} ${appointment.clientSurname}`;
  const html = emailTemplates.ownerNewRequest(appointment, confirmUrl, declineUrl);
  return await sendEmail(ownerEmail, subject, html);
};

// Send visitor approval confirmation
const sendVisitorApprovalConfirmation = async (appointment, professional, cancelUrl) => {
  const subject = '✅ Appointment Confirmed!';
  const html = emailTemplates.visitorApprovalConfirmation(appointment, professional, cancelUrl);
  return await sendEmail(appointment.clientEmail, subject, html);
};

// Send visitor decline notification
const sendVisitorDeclineNotification = async (appointment, professional) => {
  const subject = 'Appointment Request Update';
  const html = emailTemplates.visitorDeclineNotification(appointment, professional);
  return await sendEmail(appointment.clientEmail, subject, html);
};

// Send visitor cancellation confirmation
const sendVisitorCancellationConfirmation = async (appointment, professional) => {
  const subject = 'Appointment Cancelled';
  const html = emailTemplates.visitorCancellationConfirmation(appointment, professional);
  return await sendEmail(appointment.clientEmail, subject, html);
};

// Send owner cancellation notification
const sendOwnerCancellationNotification = async (appointment, ownerEmail) => {
  const subject = `❌ Appointment Cancelled - ${appointment.clientName} ${appointment.clientSurname}`;
  const html = emailTemplates.ownerCancellationNotification(appointment);
  return await sendEmail(ownerEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendVisitorRequestConfirmation,
  sendOwnerNewRequestNotification,
  sendVisitorApprovalConfirmation,
  sendVisitorDeclineNotification,
  sendVisitorCancellationConfirmation,
  sendOwnerCancellationNotification
};

