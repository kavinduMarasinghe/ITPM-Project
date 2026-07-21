# EventAura

EventAura is a full-stack event management platform that brings together event organizers, vendors, sponsors, students, and administrators in a single workspace. It covers the full event lifecycle — from planning and team collaboration through stall booking, sponsorship, payments, attendance tracking, and post-event analytics.

The repository is organized as a monorepo with a Node.js/Express + MongoDB backend and a React (Vite) + TailwindCSS frontend.

---

## Table of Contents

- [Modules & Features](#modules--features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Documentation](#documentation)
- [Team & Module Ownership](#team--module-ownership)
- [Troubleshooting](#troubleshooting)

---

## Modules & Features

### 1. Authentication & User Management
- Role-based access for **Admin**, **Organizer**, **Vendor**, and **Student** users.
- Vendor registration and login with **bcrypt** password hashing and **JWT** sessions.
- Unified auth service with token validation and role guards across protected routes.
- Profile settings page shared across roles.

### 2. Event Management (Organizer)
- Create, update, and delete events with rich metadata (title, description, dates, capacity, venue, status).
- "My Events", past events, performance analytics, timeline, workload, and risk panels.
- Event interaction tracking and session/check-in support.
- Live event mode with real-time controls.

### 3. Stall & Booking Management (Vendor + Admin)
- Admin can create, edit, and list stalls, plus view a layout map.
- Vendors browse events, view stalls, submit booking requests, and pay for confirmed bookings.
- Booking approval workflow on the admin side (approve / reject / pending states).
- QR code generation for confirmed bookings; vendors carry a barcode for entry.

### 4. Attendance & Check-In
- QR/barcode scanning page (`ScanAttendance`) for on-site attendance capture.
- Attendance log dashboard for admins.
- Stored attendance records linked to events, stalls, and bookings.

### 5. Task & Team Collaboration (G\_ module)
- Communities and societies with member management.
- Event-scoped tasks with status (To-Do / In Progress / Done), assignees, due dates, priorities.
- Task templates, task notifications, and a global notification bell.
- In-app event chat and file sharing per event.

### 6. Sponsorship & Payment (Finance module)
- Sponsorship package CRUD (Bronze / Silver / Gold / Platinum tiers, etc.).
- Sponsor request workflow with **email notifications** (nodemailer):
  - Admin sends a styled HTML email with **Accept / Reject** buttons.
  - Sponsor click updates the request status in MongoDB and shows a confirmation page.
- Sponsor application submissions tracked by event and package.
- Payments with status tracking, organizer approval, and PDF invoice generation (`pdfkit` / `jspdf`).
- Financial dashboard and revenue report with charts (recharts / chart.js).

### 7. Reporting & Analytics
- Organizer-side performance, workload, and risk reports.
- Finance-side revenue report with downloadable views.
- Charts powered by `recharts` and `chart.js`.

---

## Tech Stack

**Backend**
- Node.js, Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + `bcryptjs` for auth
- `nodemailer` for email (sponsor request flow)
- `dotenv`, `cors`, `nodemon` (dev)
- ESM (`.mjs`) sponsor/payment routes mounted dynamically into the CommonJS app

**Frontend**
- React 18, Vite 5
- TailwindCSS + Radix UI primitives
- `react-router-dom`, `axios`, `lucide-react`, `react-icons`
- Charts: `recharts`, `chart.js`
- QR / Barcode: `html5-qrcode`, `qrcode.react`
- PDF & image: `jspdf`, `html2canvas`
- Notifications: `react-hot-toast`

---

## Project Structure

```
ITPM-Project/
├── Backend/                  # Node.js + Express API
│   ├── app.js                # App entry (CJS, mounts ESM sponsor/payment routes)
│   ├── config/               # DB and app config
│   ├── controllers/          # Legacy + G_ controllers (auth, events, stalls, tasks…)
│   ├── routes/               # Legacy + G_ route definitions
│   ├── models/               # Mongoose models (User, Event, Stall, Tasks…)
│   ├── middleware/           # JWT auth, error handling
│   ├── utils/                # Helpers
│   ├── scripts/              # Seed / migration / diagnostic scripts
│   └── src/                  # Unified EventAura layer
│       ├── routes/           # Unified + sponsor/payment ESM routes (.mjs)
│       ├── controllers/      # Unified + sponsor/payment controllers
│       ├── models/           # User, Event, Sponsor*, Payment, Invoice, Reservation
│       ├── services/         # authService, etc.
│       ├── recommendation/   # Recommendation logic
│       └── utils/            # AppError + shared utilities
│
├── Frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── pages/            # Route-level pages
│   │   │   ├── admin/        # AdminDashboard, StallList, BookingRequests…
│   │   │   ├── vendor/       # VendorDashboard, MyBookings, PaymentCheckout…
│   │   │   ├── auth/         # Login, RegisterAdmin, RegisterVendor
│   │   │   ├── shared/       # ProfileSettings, ScanAttendance
│   │   │   ├── G_*.jsx       # Organizer/team workspace pages
│   │   │   ├── Sponsor*.jsx  # Sponsorship pages
│   │   │   └── Financial*    # Finance dashboard & reports
│   │   ├── Components/       # Layouts, sidebars, dialogs, UI primitives
│   │   ├── api/              # API clients (axios)
│   │   ├── services/         # Higher-level service wrappers
│   │   ├── context/          # React contexts (auth, notifications…)
│   │   ├── hooks/            # Custom hooks
│   │   └── lib/              # Utilities
│   └── vite.config.js
│
├── img/                      # Project images / assets
├── server/                   # Member-4 module starter (reference only)
├── EMAIL_SETUP.md            # Gmail / SMTP configuration guide
├── MAILTRAP_SETUP.md         # Mailtrap configuration for testing
├── QUICK_START.md            # 2-minute setup walkthrough
├── SPONSOR_REQUEST_FLOW.md   # Detailed sponsor request flow doc
└── README.md                 # You are here
```

---

## Prerequisites

- **Node.js** 18 or newer (LTS recommended)
- **npm** 9+ (or `bun` — a `bun.lock` is checked in for the frontend)
- **MongoDB** (local instance or MongoDB Atlas connection string)
- A working **SMTP** account for the sponsor email flow (Gmail App Password or Mailtrap — see [EMAIL_SETUP.md](EMAIL_SETUP.md) / [MAILTRAP_SETUP.md](MAILTRAP_SETUP.md))

---

## Quick Start

### 1. Clone the repository
```bash
git clone <repo-url>
cd ITPM-Project
```

### 2. Backend setup
```bash
cd Backend
npm install
# create a .env file (see "Environment Variables" below)
npm run dev
```
You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5001
✅ Sponsor/payment routes mounted
```

### 3. Frontend setup
In a second terminal:
```bash
cd Frontend
npm install
npm run dev
```
The app starts on http://localhost:5173.

For a deeper walkthrough of the sponsor email flow specifically, see [QUICK_START.md](QUICK_START.md).

---

## Environment Variables

Create `Backend/.env` with at least:

```env
# Database (replace with your own local URI or Atlas connection string)
MONGO_URI=mongodb://localhost:27017/eventAuraDB
# Example for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/eventAuraDB?retryWrites=true&w=majority

# Server
PORT=5000
BACKEND_URL=http://localhost:5000

# Auth
JWT_SECRET=your-strong-random-secret

# Email (sponsor request flow)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx     # 16-char Gmail App Password
```

For Mailtrap-based testing, follow [MAILTRAP_SETUP.md](MAILTRAP_SETUP.md). For Gmail App Passwords, follow [EMAIL_SETUP.md](EMAIL_SETUP.md).

---

## Available Scripts

### Backend (`/Backend`)
| Script         | Description                              |
|----------------|------------------------------------------|
| `npm run dev`  | Start API with nodemon (hot reload)      |
| `npm start`    | Same as `dev` (configured to nodemon)    |

### Frontend (`/Frontend`)
| Script           | Description                          |
|------------------|--------------------------------------|
| `npm run dev`    | Start Vite dev server                |
| `npm run build`  | Build production bundle              |
| `npm run preview`| Preview the production build         |
| `npm run lint`   | Run ESLint over `src/`               |

---

## API Overview

All routes are served under `/api`. Selected endpoints:

**Auth**
- `POST /api/auth/register` — vendor registration
- `POST /api/auth/login` — login (issues JWT)
- `GET  /api/auth/users` — directory lookup (authenticated)

**Events (organizer/internal)**
- `GET/POST/PUT/DELETE /api/events` — unified event request flow
- `GET/POST/PUT/DELETE /api/g-events` — G\_ internal event CRUD

**Stalls & Bookings**
- `GET/POST/PUT/DELETE /api/stalls`
- `GET/POST/PUT       /api/stall-bookings`
- `GET/POST           /api/attendance`

**Communities / Tasks / Chat**
- `/api/communities`, `/api/tasks`, `/api/task-notifications`, `/api/chat`

**Sponsorship & Payment**
- `GET/POST/PUT/DELETE /api/sponsorship-packages`
- `POST /api/sponsor-requests` — send email invitation
- `GET  /api/sponsor-requests` — list requests
- `GET  /api/sponsor-requests/:id/accept` — sponsor accept link
- `GET  /api/sponsor-requests/:id/reject` — sponsor reject link
- `GET/POST/PUT       /api/sponsor-applications`
- `GET/POST           /api/payments`
- `GET                /api/invoices/:id` — generate / download PDF invoice

See [SPONSOR_REQUEST_FLOW.md](SPONSOR_REQUEST_FLOW.md) for end-to-end details of the sponsor email flow.

---

## Documentation

- [QUICK_START.md](QUICK_START.md) — 2-minute setup and test checklist
- [EMAIL_SETUP.md](EMAIL_SETUP.md) — Gmail / SMTP configuration
- [MAILTRAP_SETUP.md](MAILTRAP_SETUP.md) — Mailtrap dev configuration
- [SPONSOR_REQUEST_FLOW.md](SPONSOR_REQUEST_FLOW.md) — sponsor request architecture & flow

---

## Team & Module Ownership

EventAura is built collaboratively across modules:

| Member   | Module                                                            | Key folders / prefixes                                         |
|----------|-------------------------------------------------------------------|----------------------------------------------------------------|
| Member 1 | Authentication & User Management **+** Event Creation, Scheduling & Management | `Backend/src/controllers/authController.js`, `Backend/src/controllers/eventController.js`, `Frontend/src/pages/auth/`, event creation/scheduling pages |
| Member 2 | Stalls, Bookings & Attendance                                     | `Backend/controllers/stallController.js`, `bookingController.js`, `Frontend/src/pages/admin/`, `vendor/` |
| Member 3 | Sponsorship & Payment (Finance)                                   | `Backend/src/**/*.mjs` (sponsor/payment/invoice), `Frontend/src/pages/Sponsor*`, `Financial*` |
| Member 4 | Tasks, Communities & Chat (G\_ suite)                             | `Backend/controllers/*g.js`, `Backend/models/G_*`, `Frontend/src/Components/G_*` |

---

## Troubleshooting

- **MongoDB connection error** — Verify `MONGO_URI` in `Backend/.env` and that the MongoDB service / Atlas IP allowlist is reachable.
- **CORS errors from the frontend** — The backend currently allows `http://localhost:5173`, `5174`, `5175`, and `3000`. Add your origin in `Backend/app.js` if running on a different port.
- **Sponsor emails not sending** — Confirm `EMAIL_USER` / `EMAIL_PASS` (Gmail App Password, not a normal password) and restart the backend. See [EMAIL_SETUP.md](EMAIL_SETUP.md).
- **Sponsor Accept/Reject links don't open** — The backend must be running on `BACKEND_URL` and reachable from the email recipient's machine.
- **Port already in use** — Change `PORT` in `Backend/.env`, or set a custom port for Vite via `npm run dev -- --port 5174`.

---

Happy building with **EventAura** 🎉

