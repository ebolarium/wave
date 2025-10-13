const express = require('express');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { 
  sendVisitorApprovalConfirmation, 
  sendVisitorDeclineNotification,
  sendVisitorCancellationConfirmation,
  sendOwnerCancellationNotification
} = require('../services/emailService');
const router = express.Router();

// Generate secure token for email actions
const generateActionToken = (appointmentId, action) => {
  return jwt.sign(
    { appointmentId, action },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   GET /api/appointment-actions/confirm/:token
// @desc    Confirm appointment via email link (Owner)
// @access  Public (via secure token)
router.get('/confirm/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    
    if (decoded.action !== 'confirm') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Invalid Action</h1>
            <p>This link is not valid for this action.</p>
          </body>
        </html>
      `);
    }

    const appointment = await Appointment.findById(decoded.appointmentId).populate('user', 'firstName lastName email');
    
    if (!appointment) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Appointment Not Found</h1>
            <p>This appointment no longer exists or has been deleted.</p>
          </body>
        </html>
      `);
    }

    if (appointment.status !== 'pending') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>⚠️ Already Processed</h1>
            <p>This appointment has already been ${appointment.status}.</p>
          </body>
        </html>
      `);
    }

    // Update appointment status
    appointment.status = 'confirmed';
    await appointment.save();

    // Generate cancel token and send confirmation email to visitor
    const cancelToken = generateActionToken(appointment._id, 'cancel');
    const cancelUrl = `${process.env.API_URL}/api/appointment-actions/cancel/${cancelToken}`;
    await sendVisitorApprovalConfirmation(appointment, appointment.user, cancelUrl);

    res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            h1 { color: #10b981; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Appointment Confirmed!</h1>
            <p>The appointment with ${appointment.clientName} ${appointment.clientSurname} has been successfully confirmed.</p>
            <p>The client has been notified via email.</p>
            <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>An error occurred while processing your request.</p>
        </body>
      </html>
    `);
  }
});

// @route   GET /api/appointment-actions/decline/:token
// @desc    Decline appointment via email link (Owner)
// @access  Public (via secure token)
router.get('/decline/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    
    if (decoded.action !== 'decline') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Invalid Action</h1>
            <p>This link is not valid for this action.</p>
          </body>
        </html>
      `);
    }

    const appointment = await Appointment.findById(decoded.appointmentId).populate('user', 'firstName lastName email');
    
    if (!appointment) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Appointment Not Found</h1>
            <p>This appointment no longer exists or has been deleted.</p>
          </body>
        </html>
      `);
    }

    if (appointment.status !== 'pending') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>⚠️ Already Processed</h1>
            <p>This appointment has already been ${appointment.status}.</p>
          </body>
        </html>
      `);
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    // Send decline notification email to visitor
    await sendVisitorDeclineNotification(appointment, appointment.user);

    res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            h1 { color: #ff6b6b; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Appointment Declined</h1>
            <p>The appointment with ${appointment.clientName} ${appointment.clientSurname} has been declined.</p>
            <p>The client has been notified via email.</p>
            <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Decline appointment error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>An error occurred while processing your request.</p>
        </body>
      </html>
    `);
  }
});

// @route   GET /api/appointment-actions/cancel/:token
// @desc    Cancel appointment via email link (Visitor)
// @access  Public (via secure token)
router.get('/cancel/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    
    if (decoded.action !== 'cancel') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Invalid Action</h1>
            <p>This link is not valid for this action.</p>
          </body>
        </html>
      `);
    }

    const appointment = await Appointment.findById(decoded.appointmentId).populate('user', 'firstName lastName email');
    
    if (!appointment) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Appointment Not Found</h1>
            <p>This appointment no longer exists or has been deleted.</p>
          </body>
        </html>
      `);
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>⚠️ Already Cancelled</h1>
            <p>This appointment has already been cancelled.</p>
          </body>
        </html>
      `);
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    // Send cancellation confirmation to visitor
    await sendVisitorCancellationConfirmation(appointment, appointment.user);

    // Send cancellation notification to owner
    await sendOwnerCancellationNotification(appointment, appointment.user.email);

    res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            h1 { color: #667eea; }
            p { margin: 15px 0; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Appointment Cancelled</h1>
            <p>Your appointment has been successfully cancelled.</p>
            <p>You can book another appointment anytime.</p>
            <a href="${process.env.CLIENT_URL}/calendar" class="btn">Book New Appointment</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>An error occurred while processing your request.</p>
        </body>
      </html>
    `);
  }
});

module.exports = { router, generateActionToken };

