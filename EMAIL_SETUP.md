# Email Service Setup Guide

## Overview
This application uses Nodemailer to send email notifications for appointment bookings, approvals, and cancellations.

## Installation

First, install Nodemailer:

```bash
npm install nodemailer
```

## Email Configuration

### 1. Add Environment Variables

Copy the variables from `env.example.txt` to your `.env` file:

```env
# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=Energy Waves <noreply@energywaves.com>

# Application URLs for Email Links
APP_URL=http://localhost:3000   # Frontend URL (React app)
API_URL=http://localhost:5000   # Backend URL (Express server)
```

### 2. Gmail Setup (Recommended for Development)

If using Gmail, you need to create an **App Password**:

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to: **Security** > **2-Step Verification**
3. Enable 2-Step Verification if not already enabled
4. Scroll down to **App Passwords**
5. Generate a new app password for "Mail"
6. Copy the 16-character password
7. Use this in `EMAIL_PASSWORD` (not your regular Gmail password)

**Example Configuration:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Your app password
EMAIL_FROM=Energy Waves <youremail@gmail.com>
```

### 3. Alternative Email Providers

#### SendGrid (Recommended for Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## Email Flow

### 1. Visitor Books Appointment (Public Calendar)
**Triggers 2 emails:**

✉️ **To Visitor:**
- Subject: "Appointment Request Received - Pending Approval"
- Content: Confirmation that request was received
- Status: Pending approval

✉️ **To Owner:**
- Subject: "New Appointment Request - [Client Name]"
- Content: Full appointment details
- Actions: ✓ Approve | ✕ Decline buttons

### 2. Owner Approves Appointment (Dashboard or Email Link)
**Triggers 1 email:**

✉️ **To Visitor:**
- Subject: "Appointment Confirmed!"
- Content: Confirmation details
- Action: Cancel Appointment button (with secure link)

### 3. Owner Declines Appointment (Dashboard or Email Link)
**Triggers 1 email:**

✉️ **To Visitor:**
- Subject: "Appointment Request Update"
- Content: Notification that appointment wasn't confirmed
- Action: Book Another Appointment button

### 4. Visitor Cancels Appointment (Email Link)
**Triggers 1 email:**

✉️ **To Visitor:**
- Subject: "Appointment Cancelled"
- Content: Cancellation confirmation

## Email Actions (Secure Links)

All email action links use JWT tokens with 7-day expiration:

- **Approve**: `/api/appointment-actions/confirm/:token`
- **Decline**: `/api/appointment-actions/decline/:token`
- **Cancel**: `/api/appointment-actions/cancel/:token`

These links work without login and provide HTML responses with confirmation.

## Testing Emails

### Development Mode
You can use:
- **Gmail** with app password
- **Ethereal Email** (fake SMTP for testing): https://ethereal.email

### Test Configuration with Ethereal
```javascript
// In emailService.js for testing only:
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransporter({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});
```

## Troubleshooting

### Email Not Sending?

1. **Check environment variables** are loaded:
   ```javascript
   console.log('Email config:', {
     host: process.env.EMAIL_HOST,
     user: process.env.EMAIL_USER
   });
   ```

2. **Check Gmail security** - App password required

3. **Check firewall** - Port 587 must be open

4. **Check logs** - Look for email errors in server console

### Common Errors

**"Invalid login"** → Check EMAIL_USER and EMAIL_PASSWORD
**"Connection timeout"** → Check EMAIL_HOST and EMAIL_PORT
**"Self signed certificate"** → Add `tls: { rejectUnauthorized: false }` to transporter

## Production Recommendations

1. Use a dedicated email service (SendGrid, Mailgun, AWS SES)
2. Set up proper SPF, DKIM, and DMARC records
3. Monitor email deliverability
4. Implement email queue for better performance
5. Add retry logic for failed sends
6. Log all email activities

### 5. Owner Deletes Confirmed Appointment (Dashboard)
**Triggers 1 Email:**

✉️ **To Visitor:**
- Subject: "Appointment Cancelled"
- Content: Notification that appointment was cancelled

## Email Templates

All email templates are in `services/emailService.js`:
- Modern, responsive design
- Color-coded by action (orange=pending, green=approved, red=declined/cancelled)
- Professional branding
- Clear call-to-action buttons

### Template List:
1. `visitorRequestConfirmation` - Visitor books appointment
2. `ownerNewRequest` - Owner receives new request
3. `visitorApprovalConfirmation` - Visitor's appointment approved
4. `visitorDeclineNotification` - Visitor's appointment declined
5. `visitorCancellationConfirmation` - Visitor cancels or owner deletes
6. `ownerCancellationNotification` - Owner notified of visitor cancellation

## Security

- ✅ JWT tokens expire after 7 days
- ✅ One-time action links (can't reuse)
- ✅ Validates appointment status before action
- ✅ No sensitive data in URLs
- ✅ HTML injection prevention

## Support

For issues or questions about email setup, check:
- Nodemailer documentation: https://nodemailer.com
- Your email provider's SMTP documentation

