# 🚀 Sponsor Request Flow - Quick Setup Guide

## ✅ What Was Just Implemented

You now have a **complete real-world sponsor request system** with:

1. ✅ **Backend Email Integration** - Nodemailer sends professional emails
2. ✅ **MongoDB Database** - Stores all sponsor requests with status tracking
3. ✅ **Accept/Reject Links** - Sponsors click email buttons to respond
4. ✅ **Status Updates** - Real-time status changes in database
5. ✅ **Frontend Integration** - Applications page shows live status

---

## ⚡ Quick Setup (2 minutes)

### 1️⃣ Configure Email (.env)

Create/edit `.env` file in **Backend** folder:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
BACKEND_URL=http://localhost:5001
```

**For Gmail:**
- Go to: https://myaccount.google.com/apppasswords
- Select "Mail" and "Windows Computer"
- Copy the 16-character password
- Paste into EMAIL_PASS

### 2️⃣ Restart Backend

```bash
cd Backend
npm run dev
```

You should see:
```
MongoDB Connected
Server running on port 5001
```

### 3️⃣ Test the System

1. Open Frontend: `http://localhost:5173`
2. Click **"Request Sponsors"**
3. Fill in form:
   - Company: `Test Company`
   - Email: `your-email@gmail.com` (your real email)
   - Event: `Tech Fest 2025`
   - Package: `Gold`
4. Click **"Preview & Send"**
5. Click **"Send Request"**

**You should receive an email with Accept/Reject buttons!**

---

## 📧 Email Flow

### Email Received:
- ✅ Professional HTML email
- ✅ Sponsorship details
- ✅ Green **Accept** button
- ✅ Red **Reject** button

### Click Accept:
- Your browser opens: `http://localhost:5001/api/sponsor-requests/[ID]/accept`
- Shows: **"Sponsorship Accepted!"** page
- Database updated: status = "accepted"

### Click Reject:
- Your browser opens: `http://localhost:5001/api/sponsor-requests/[ID]/reject`
- Shows: **"Sponsorship Declined"** page
- Database updated: status = "rejected"

### Return to Dashboard:
- Go to **Applications** page
- **Refresh** the page
- Status now shows: 🟢 **Accepted** or 🔴 **Rejected**

---

## 📊 Database Status

Each sponsor request stores:

```
{
  _id: "mongo-id",
  companyName: "Celcom Axiata",
  email: "celcom@axiata.com",
  eventName: "Tech Fest 2025",
  packageName: "Gold",
  subject: "Sponsorship Invitation...",
  message: "Dear Celcom Axiata Team...",
  status: "pending" → "accepted" or "rejected",
  sentAt: timestamp,
  respondedAt: timestamp (when they click accept/reject),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔗 API Endpoints Ready

```
✅ POST   /api/sponsor-requests              → Send invitation
✅ GET    /api/sponsor-requests              → List all requests
✅ GET    /api/sponsor-requests/:id          → Get single request
✅ GET    /api/sponsor-requests/:id/accept   → Accept link (in email)
✅ GET    /api/sponsor-requests/:id/reject   → Reject link (in email)
```

---

## 🧪 Test Checklist

- [ ] Backend running on port 5001
- [ ] Email configured in .env
- [ ] Send test request from frontend
- [ ] Email received in inbox
- [ ] Accept button works (shows green success page)
- [ ] Reject button works (shows red decline page)
- [ ] Refresh applications page → status updated
- [ ] Package prices show correctly in applications table

---

## 🎯 Real-World Usage

### For Local Testing (Current):
- Everything works on your machine
- Sponsor opens email on same machine
- Links like: `http://localhost:5001/...`

### For Production (Future):
- Deploy backend to Render/Railway/Vercel
- Update `BACKEND_URL=https://your-backend.com`
- Email links work globally
- Sponsors can respond from anywhere

---

## 🐛 Common Issues & Fixes

### ❌ Email not sending?
**Solution:**
1. Check .env has EMAIL_USER and EMAIL_PASS
2. Gmail: Enable "App passwords" (not regular password)
3. Restart backend: `npm run dev`
4. Check browser console for errors

### ❌ Accept/Reject links not working?
**Solution:**
1. Backend must be running on port 5001
2. MongoDB must be connected
3. Check: `http://localhost:5001` opens your backend
4. Try restarting backend

### ❌ Applications page not showing requests?
**Solution:**
1. **Refresh the page** (no real-time updates yet)
2. Backend should return requests from `/api/sponsor-requests`
3. Check Network tab in DevTools
4. Check browser console for fetch errors

### ❌ Email receives but no buttons?
**Solution:**
1. Check email is in HTML format (not plain text)
2. Try different email client (Gmail, Outlook, etc.)
3. Check spam folder
4. Restart backend and resend

---

## 📝 Example Test Scenario

1. **Admin side** (Your machine)
   - Click "Request Sponsors"
   - Select "DataSoft Solutions"
   - Email: `datasoft@mail.com`
   - Package: Gold
   - Click Send

2. **Sponsor side** (Same machine, different view)
   - Go to: `http://localhost:5001/api/sponsor-requests`
   - Check request status (should be "pending")
   - OR check email inbox
   - Click Accept/Reject button from email

3. **Admin sees update**
   - Go to Applications page
   - **Refresh** page
   - Status shows: ✅ Accepted or ❌ Rejected

---

## 🎓 How It Works Behind the Scenes

```
1. Admin clicks "Send Request"
   ↓
2. Frontend sends data to backend
   ↓
3. Backend creates SponsorRequest in MongoDB
   ↓
4. Backend sends email with Accept/Reject links
   ↓
5. Sponsor receives email
   ↓
6. Sponsor clicks Accept or Reject
   ↓
7. Backend updates SponsorRequest status in MongoDB
   ↓
8. Shows success/decline page to sponsor
   ↓
9. Admin sees updated status in Applications page (after refresh)
```

---

## 🚀 You're All Set!

**Start Testing:**
1. Ensure backend is running
2. Send a test sponsor request
3. Check your email inbox
4. Click Accept/Reject
5. Watch status update in dashboard

**Questions?** Check the error console (Ctrl+Shift+J in browser) or backend logs.

Happy sponsorship management! 🎉
