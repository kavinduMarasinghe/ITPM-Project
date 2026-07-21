# 📧 Email Setup Guide for EVENTAURA

This guide explains how to set up real email sending for sponsor requests.

## ✅ Prerequisites

You need:
- Gmail account (or any email service)
- Gmail App Password (for security)
- Backend running on `localhost:5001`

## 🔐 Step 1: Get Gmail App Password

### If Using Gmail:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Factor Authentication** (if not already enabled)
3. Find **"App passwords"** in the left menu
4. Select "Mail" and "Windows Computer" (or your device)
5. Google will generate a **16-character password**
6. Copy this password (you'll use it in .env)

### Example App Password:
```
abcd efgh ijkl mnop
```

## 📝 Step 2: Update .env File

Edit `/Backend/.env`:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/event_system
PORT=5001

# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_SERVICE=gmail
BACKEND_URL=http://localhost:5001
```

**Replace:**
- `your_gmail@gmail.com` → Your actual Gmail address
- `abcdefghijklmnop` → Your 16-character App Password (no spaces)

## 🧪 Step 3: Test Email Connection

### Using Thunder Client or Postman:

1. **Start Backend**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Send Test Email**
   ```
   POST http://localhost:5001/api/test-email
   
   Headers:
   Content-Type: application/json
   
   Body (JSON):
   {
     "to": "your-test@gmail.com",
     "subject": "Test Email from EVENTAURA",
     "body": "<h1>It Works! ✅</h1><p>Email sending is configured correctly.</p>"
   }
   ```

3. **Expected Response:**
   ```json
   {
     "message": "Test email sent successfully",
     "details": { ... }
   }
   ```

✅ If you receive the email, you're all set!

## 📧 Step 4: Send Sponsor Request with Email

Once configured, sponsor requests automatically send emails when you:

1. Add sponsor emails in **Applications page**
2. Click "Send Sponsor Request"
3. Fill in the form
4. Click "Send Request"

The email will be sent to the saved sponsor email with:
- Personalized message
- Accept/Reject buttons
- Company branding

## 🔍 How It Works

```
Frontend (Save Email)
    ↓
Applications Page → sponsorEmails state
    ↓
Compose Modal → Select saved email
    ↓
handleSendRequest() → POST to backend
    ↓
Backend (/api/sponsor-requests)
    ↓
Nodemailer → Gmail SMTP
    ↓
Sponsor's Email Inbox ✅
```

## 🐛 Troubleshooting

### Email not sending?

1. **Check .env variables:**
   ```bash
   # In Backend directory
   cat .env
   ```
   Make sure `EMAIL_USER` and `EMAIL_PASS` are set.

2. **Check backend logs:**
   ```
   npm run dev
   ```
   Look for `✅ Email transporter ready` or `❌ Email transporter error`

3. **Verify Gmail App Password:**
   - Must be exactly 16 characters (no spaces)
   - Must be generated from App Passwords page (not regular password)
   - Account must have 2FA enabled

4. **Test endpoint:**
   ```bash
   curl -X POST http://localhost:5001/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to":"test@gmail.com"}'
   ```

### "Less secure apps" error?

- Modern Gmail doesn't allow this anymore
- Always use **App Passwords** instead
- If you see errors about "Less secure apps", your account isn't using 2FA + App Password

### Port blocked?

- Make sure backend is running on port 5001
- Check firewall/antivirus isn't blocking port 5001

## 📱 Using Other Email Services

### Outlook/Hotmail:
```dotenv
EMAIL_SERVICE=outlook
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

### Yahoo:
```dotenv
EMAIL_SERVICE=yahoo
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

### Custom SMTP:
```dotenv
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_password
```

## ✨ What Happens When Email is Sent

1. **Email Created** - Request saved to MongoDB
2. **Email Composed** - HTML template with accept/reject links
3. **Email Sent** - Via Gmail SMTP
4. **Status Tracked** - Status = "pending" in database
5. **Accept/Reject** - Sponsor clicks button → status updated

## 📊 Email Status Tracking

| Status | Meaning |
|--------|---------|
| `pending` | Email sent, waiting for response |
| `accepted` | Sponsor clicked "Accept Sponsorship" |
| `rejected` | Sponsor clicked "Decline Sponsorship" |

## 🚀 Production Setup

For production, use environment variables from your hosting service (Heroku, Railway, Vercel, etc.):

1. Set `EMAIL_USER` environment variable
2. Set `EMAIL_PASS` environment variable
3. Set `BACKEND_URL` to your production domain
4. Test with test email endpoint first

---

**Questions?** Check the backend logs or test email endpoint for detailed error messages.
