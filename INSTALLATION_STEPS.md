# Installation & Setup Steps

## 1. Install Dependencies

Run this command in the project root to install Nodemailer:

```bash
npm install
```

This will install nodemailer along with all other dependencies.

## 2. Configure Email Settings

### Add to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=Energy Waves <noreply@energywaves.com>

# Application URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
```

**Important:** 
- `APP_URL` = Your frontend URL (React app)
- `API_URL` = Your backend URL (Express server)
- These are used in email links for redirects and actions

### For Gmail Users:

1. Enable 2-Step Verification on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Copy the password and use it in `EMAIL_PASSWORD`

## 3. Restart Server

After adding email configuration, restart your server:

```bash
npm run server
```

or

```bash
node server.js
```

## 4. Test Email Functionality

### Test Flow:

1. **Visitor books appointment** → Check both emails:
   - Visitor receives: "Appointment Request Received"
   - Owner receives: "New Appointment Request" with Approve/Decline links

2. **Owner clicks Approve link** → Check visitor email:
   - Visitor receives: "Appointment Confirmed!" with Cancel link

3. **Owner clicks Decline link** → Check visitor email:
   - Visitor receives: "Appointment Not Available"

4. **Visitor clicks Cancel link** → Check both emails:
   - Visitor receives: "Appointment Cancelled"
   - Owner receives: "Appointment Cancelled - [Client Name]"

## Email Features Implemented

✅ **Visitor Request Confirmation** - Sent when booking  
✅ **Owner New Request Notification** - With approve/decline links  
✅ **Visitor Approval Confirmation** - With cancel link  
✅ **Visitor Decline Notification** - When owner rejects  
✅ **Visitor Cancellation Confirmation** - When cancelled  
✅ **Owner Cancellation Notification** - When visitor cancels  

## Files Created

- `services/emailService.js` - Email sending service & templates
- `routes/appointmentActions.js` - Email link action handlers
- `env.example.txt` - Environment variable template
- `EMAIL_SETUP.md` - Detailed email setup guide
- `INSTALLATION_STEPS.md` - This file

## Troubleshooting

**Emails not sending?**
- Check console for email errors
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail, ensure you're using App Password, not regular password
- Check spam folder for test emails

**Links not working?**
- Verify APP_URL is correct in .env
- Check that server is running on correct port
- Ensure JWT_SECRET is set in .env

## Next Steps

After email works:
1. Test all email flows thoroughly
2. Update email templates with your branding
3. For production, use a professional email service (SendGrid recommended)
4. Set up email monitoring and logging

