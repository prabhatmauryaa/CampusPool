# CampusPool — College Ride-Sharing Web Application

**Tagline:** Same destination. Shared ride. Lower cost.  
**Institution:** KIET Group of Institutions, Ghaziabad  
**Domain Restriction:** `@kiet.edu`  
**Platform:** CampusPool Student Ride-Sharing  

---

## 1. Project Overview

**CampusPool** is a premium student mobility and carpooling platform designed specifically for students and faculty of **KIET Group of Institutions**.

Students frequently commute between the Muradnagar campus and major transit hubs — including Ghaziabad Railway Station, Anand Vihar ISBT / Metro, New Delhi Railway Station, and Indira Gandhi International Airport. Individual auto-rickshaw or taxi rides can be costly, and finding fellow students travelling on similar routes has traditionally relied on fragmented WhatsApp groups or notice boards.

CampusPool provides:
- **Verified Campus Access**: Hard-locked registration and authentication requiring valid `@kiet.edu` college email addresses on both frontend and backend.
- **Trip Discovery & Search**: Route, destination, date, available seats, and women-focused ride preferences.
- **Transparent Fare Estimates**: Upfront, illustrative per-person vehicle fuel expense splitting with zero middleman commissions or surge pricing.
- **Private 1-to-1 Coordination Chat**: Dedicated, private conversation between the ride creator and confirmed passengers with quick landmark, meeting point, and ETA chips.
- **Server-Side Cancellation Policy**: Transparent tracking of eligible cancellations, clear warnings before cancellation, and automatic privilege suspension at 30 cancellations to protect student mutual reliability.
- **Strictly Confidential Incident Reporting**: In-app reporting for unsafe behaviour, harassment, or policy concerns with strict administrative confidentiality. Ordinary students cannot view other reports, investigate notes, or see who reported them.
- **Protected Administrator Dashboard**: Role-gated `/admin` portal for incident review, private investigation notes, account reinstatement upon verified appeal, student ID reviews, and immutable audit logs.
- **Student Safety & Female Co-Rider Safeguards**: Optional women-focused ride preferences, emergency helpline quick access (KIET Security Gate 0120-2974000, 112, 1090 Women Helpline), 1-click WhatsApp trip sharing with trusted contacts, and verified campus landmark meeting points.

---

## 2. Technology Stack

- **Frontend**: Next.js 16 (App Router with Turbopack), React 19, Tailwind CSS 4, Lucide Icons
- **Backend**: Node.js, Express 5, Mongoose 9, Socket.IO
- **Database**: MongoDB (Supports standard local/Atlas connection strings, with an embedded in-memory MongoDB fallback for immediate zero-config evaluation)
- **Security**: Strict server-side `@kiet.edu` domain validation, bcryptjs password hashing, JWT authentication, atomic seat allocation, rate limiting, and RBAC authorization guards

---

## 3. Directory Structure

```text
CampusPool/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB & embedded memory fallback connection
│   │   ├── controllers/
│   │   │   ├── adminController.js    # User verification, reinstatement, suspension & audit logs
│   │   │   ├── authController.js     # Register, Login, Profile & ID verification
│   │   │   ├── bookingController.js  # My rides history & dashboard summary
│   │   │   ├── chatController.js     # 1-to-1 private conversation lifecycle & messages
│   │   │   ├── notificationController.js
│   │   │   ├── reportController.js   # Confidential incident reporting & investigation notes
│   │   │   └── rideController.js     # Ride creation, search, joining & 30-limit cancellation policy
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   └── adminAuth.js          # Admin role guard
│   │   ├── models/
│   │   │   ├── AdminAuditLog.js      # Audit trail for verification, reinstatement & reports
│   │   │   ├── Booking.js            # Passenger booking record with seat allocation
│   │   │   ├── CancellationLog.js    # Eligible cancellation event logs with counter state
│   │   │   ├── Conversation.js       # 1-to-1 private ride conversation
│   │   │   ├── Message.js            # Chat message schema with coordination types
│   │   │   ├── Notification.js       # Student in-app notifications
│   │   │   ├── Report.js             # Categorized incident report schema with admin notes
│   │   │   ├── Ride.js               # Ride schema with women-focused preferences & seats
│   │   │   └── User.js               # User schema with @kiet.edu validation, cancellation count & suspension
│   │   ├── routes/                   # Express API routers
│   │   ├── tests/
│   │   │   └── runTests.js           # Automated test suite (77 passing tests)
│   │   ├── utils/
│   │   │   └── domainValidator.js    # Strict @kiet.edu email validator
│   │   ├── seed.js                   # Realistic demo dataset for testing
│   │   ├── socket.js                 # Socket.IO real-time coordination server
│   │   └── server.js                 # Express application entrypoint
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── images/
│   │       ├── carpool_ride.jpg      # High-res carpool student travel photography
│   │       └── students_travel.jpg   # Editorial student travel photo for split-screen auth
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js             # Root layout with typography, Navbar, and Footer
│   │   │   ├── page.js               # Luxury landing page with hero, fare preview & FAQs
│   │   │   ├── login/page.js         # Split-screen login with demo credentials & recovery
│   │   │   ├── register/page.js      # Split-screen register with strict @kiet.edu check
│   │   │   ├── dashboard/page.js     # Student dashboard with cancellation standing & trips
│   │   │   ├── rides/page.js         # Ride discovery with filters, sorting & women-focused pill
│   │   │   ├── rides/create/page.js  # Offer a ride with live fare split calculator
│   │   │   ├── rides/[id]/page.js    # Trip itinerary, cancellation modal, share & report modals
│   │   │   ├── my-rides/page.js      # Offered rides & joined bookings with cancellation warning
│   │   │   ├── messages/page.js      # Private messages hub with active conversation picker
│   │   │   ├── profile/page.js       # Profile, emergency contact, gender & cancellation health
│   │   │   └── admin/page.js         # Admin suite: incident reports, suspensions, ID reviews & audit
│   │   ├── components/
│   │   │   ├── AuthBanner.js         # Split-screen brand hero with student travel photography
│   │   │   ├── CancellationModal.js  # Warning modal with countdown to 30-limit suspension
│   │   │   ├── EmergencySupportModal.js # Direct-dial campus gate & national emergency numbers
│   │   │   ├── Footer.js             # Campus safety safeguards & verified KIET footer
│   │   │   ├── JoinModal.js          # Seat reservation modal
│   │   │   ├── Navbar.js             # Midnight navy luxury header with emergency trigger
│   │   │   ├── ReportModal.js        # Confidential incident report submission
│   │   │   ├── RideCard.js           # Trip card with verified host & women-focused badges
│   │   │   ├── ShareTripModal.js     # 1-click WhatsApp trip details sharing with trusted contacts
│   │   │   └── chat/ChatWindow.js    # 1-to-1 chat window with quick pickup & landmark chips
│   │   ├── context/
│   │   │   └── AuthContext.js        # Global authentication state
│   │   └── lib/
│   │       ├── api.js                # Frontend REST client with error handling
│   │       └── socket.js             # Client Socket.IO connection manager
│   ├── .env.example
│   ├── .env.local
│   └── package.json
│
└── README.md
```

---

## 4. Setup and Installation

### Prerequisites
- Node.js (v18 or higher recommended; developed and tested on Node.js v24)
- npm

### Step 1: Backend Setup
```bash
cd backend
npm install
```

Configure your environment file (already preconfigured for local development in `.env`):
```bash
cp .env.example .env
```

Key environment variables in `backend/.env`:
- `PORT=5000`
- `FRONTEND_URL=http://localhost:3000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/campuspool`
- `JWT_SECRET=campuspool_dev_secret_key_change_in_production_2026`
- `ADMIN_EMAIL=admin@kiet.edu`

> **Note on MongoDB:** If a local MongoDB daemon is running on port 27017, CampusPool connects automatically. If local MongoDB is not listening, CampusPool seamlessly initializes an embedded in-memory MongoDB database so that all APIs, seed scripts, and test suites run out-of-the-box without requiring any manual installation.

### Step 2: Frontend Setup
```bash
cd ../frontend
npm install
```

Configure your environment file (preconfigured in `frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 5. Running the Application

### Start the Backend Server:
```bash
cd backend
npm start
# or for auto-reloading dev mode:
npm run dev
```
Backend API will listen on `http://localhost:5000`.

### Start the Frontend Dev Server:
```bash
cd frontend
npm run dev
```
Frontend application will be accessible at `http://localhost:3000`.

---

## 6. Running Automated Tests

CampusPool includes an extensive automated test suite covering:
1. Strict `@kiet.edu` college domain verification (rejects Gmail, other colleges, spoofed subdomains like `kiet.edu.example.com`).
2. Authentication, password hashing, capacity management, transparent fare splitting, and atomic seat decrements.
3. Private 1-to-1 chat security, authorization boundaries, and lifecycle handling.
4. Server-side cancellation policy, eligible cancellation tracking, approaching warnings (e.g. 29 cancellations), and automatic account suspension at 30 cancellations.
5. Strictly confidential incident reports, private investigation notes, and administrative audit logging.
6. Student safety and women-focused ride preferences.

To run the complete test suite:
```bash
cd backend
npm test
```

Sample output:
```text
================================================================
  RUNNING CAMPUSPOOL TEST SUITE (KIET Group of Institutions)   
================================================================

--- Test Suite 1: College Domain Validation (@kiet.edu) ---
  ✓ PASS: Accepts student@kiet.edu
  ✓ PASS: Accepts rahul.sharma@kiet.edu
  ✓ PASS: Accepts uppercase PRIYA.VERMA@KIET.EDU (case-insensitive)
  ✓ PASS: Accepts whitespace-padded email after trim
  ✓ PASS: Rejects student@gmail.com
  ✓ PASS: Rejects student@yahoo.com
  ✓ PASS: Rejects student@outlook.com
  ✓ PASS: Rejects student@othercollege.edu
  ✓ PASS: Rejects student@kiet.edu.example.com (spoofed subdomain)
  ✓ PASS: Rejects student@fakekiet.edu
  ✓ PASS: Rejects student@kiet.edu.in
  ✓ PASS: Rejects missing local part
  ✓ PASS: Rejects empty username
  ✓ PASS: Rejects empty string
  ✓ PASS: Rejects null input

--- Test Suite 2: Authentication, Rides, Capacity & Booking ---
  ✓ PASS: User 1 created with generated ObjectId
  ✓ PASS: Password is encrypted and hashed with bcrypt
  ✓ PASS: Password verification succeeds with correct password
  ✓ PASS: Password verification fails with incorrect password
  ✓ PASS: Duplicate @kiet.edu email registration is rejected by database unique index
  ✓ PASS: Transparent fare calculation: 600 / 3 = 200 per passenger
  ✓ PASS: Ride initialized with 3 available seats
  ✓ PASS: Ride initialized in active status
  ✓ PASS: Correctly detects when creator attempts to book their own ride
  ✓ PASS: Available seats decrements from 3 to 2 after booking
  ✓ PASS: Duplicate booking check detects existing passenger in ride
  ✓ PASS: Available seats reaches 0
  ✓ PASS: Ride automatically transitions to status: full when capacity is exhausted
  ✓ PASS: Cancelling a booking restores seat capacity to 1
  ✓ PASS: Ride status automatically reverts back to active when seats become available

--- Test Suite 3: Private Ride Chat Security, Authorization & Lifecycle ---
  ✓ PASS: Private 1-to-1 conversation created successfully
  ✓ PASS: Conversation status initialized to active
  ✓ PASS: Database unique index prevents duplicate conversation for same booking
  ✓ PASS: Ride creator is authorized to access chat
  ✓ PASS: Confirmed passenger is authorized to access chat
  ✓ PASS: Third student NOT part of ride is strictly rejected (Access Denied)
  ✓ PASS: Host coordination message successfully persisted in MongoDB
  ✓ PASS: Message type correctly tagged as pickup_location
  ✓ PASS: Passenger ETA message successfully persisted in MongoDB
  ✓ PASS: Message type correctly tagged as eta
  ✓ PASS: Message history returns exactly 2 messages in chronological order
  ✓ PASS: Conversation transitioned to booking_cancelled upon booking cancellation
  ✓ PASS: Further messaging disabled when booking is cancelled

--- Test Suite 4: Ride Cancellation Tracking, Thresholds & Suspension (Limit: 30) ---
  ✓ PASS: Cancelling an empty ride with 0 passengers does NOT increment eligible cancellation count
  ✓ PASS: Cancellation record for empty ride correctly marked as isEligible: false
  ✓ PASS: Passenger cancelling confirmed booking increments cancellation count by exactly 1
  ✓ PASS: Confirmed booking cancellation correctly flagged as eligible cancellation
  ✓ PASS: Seat restored to ride pool after passenger booking cancellation
  ✓ PASS: Duplicate cancellation request is rejected with 400 Bad Request
  ✓ PASS: Duplicate cancellation does NOT double-count against user
  ✓ PASS: Host cancelling ride with active co-riders increments host cancellation count by 1
  ✓ PASS: Host cancellation does NOT penalize passenger (count remains unchanged)
  ✓ PASS: Accurately reports user cancellation count of 29
  ✓ PASS: Correctly flags isApproachingLimit: true at 29 cancellations
  ✓ PASS: User at 29 cancellations is NOT yet suspended
  ✓ PASS: User cancellation count reaches 30
  ✓ PASS: User is AUTOMATICALLY suspended upon reaching 30 cancellations
  ✓ PASS: Suspension reason clearly documented on account
  ✓ PASS: Suspended user is blocked from creating rides (HTTP 403)
  ✓ PASS: Response code indicates ACCOUNT_SUSPENDED
  ✓ PASS: Student account successfully reinstated following administrative review
  ✓ PASS: Cancellation count reset to 0 upon administrative reinstatement
  ✓ PASS: Administrative reinstatement recorded in AdminAuditLog
  ✓ PASS: Audit log records administrator ID

--- Test Suite 5: Incident Reporting, Confidentiality & Moderation ---
  ✓ PASS: Student can submit incident report in confidence
  ✓ PASS: Report saved in MongoDB and returned reportId
  ✓ PASS: Report category correctly persisted as unsafe_pickup
  ✓ PASS: Initial report status is pending
  ✓ PASS: Client response does not leak admin notes
  ✓ PASS: Admin can filter and retrieve pending reports
  ✓ PASS: Admin can inspect reporting student roll number
  ✓ PASS: Report status successfully transitioned to under_review
  ✓ PASS: Private admin investigation notes saved
  ✓ PASS: Report status modification logged in AdminAuditLog

--- Test Suite 6: Student Safety & Women-Focused Ride Preferences ---
  ✓ PASS: Ride successfully created with womenOnly: true
  ✓ PASS: Ride coRiderPreference set to women_focused
  ✓ PASS: Women-focused ride discovered via womenOnly query filter

================================================================
  ALL TESTS PASSED! (77/77 tests successful)
================================================================
```

---

## 7. Pre-Seeded Demonstration Accounts

For ease of testing, the application comes seeded with realistic campus accounts:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Student (Host)** | Rahul Sharma | `rahul.sharma@kiet.edu` | `Password@123` | B.Tech CSE, 3rd Year, Verified Student |
| **Student (Host - Women Focused)** | Priya Verma | `priya.verma@kiet.edu` | `Password@123` | B.Tech IT, 3rd Year, Verified Student |
| **Student (Passenger)** | Aman Gupta | `aman.gupta@kiet.edu` | `Password@123` | B.Tech ECE, 2nd Year |
| **Campus Admin** | Campus Admin | `admin@kiet.edu` | `Password@123` | Authorized Security & Verification Officer |

*(1-click login buttons are also available on the `/login` screen for fast evaluation).*

---

## 8. Cancellation Policy Rules

| Scenario | Counts as Eligible Cancellation? | Reason |
|---|---|---|
| **Host cancels ride with confirmed co-riders** | **Yes (+1)** | Affects other students who planned their travel time. |
| **Passenger cancels confirmed booking** | **Yes (+1)** | Deprives other students of the reserved seat. |
| **Host cancels empty ride (0 passengers joined)** | **No (0)** | No fellow students are inconvenienced. |
| **Ride cancelled by host (impact on passenger)** | **No (0)** | Passenger did not initiate cancellation. |
| **Ride cancelled by Campus Administrator** | **No (0)** | System or administrative intervention. |
| **Reaching 30 eligible cancellations** | **Suspension Trigger** | User is automatically suspended from posting or joining rides. |
| **Administrative Reinstatement** | **Privileges Restored** | Administrator reviews appeal and resets status with logged audit reason. |

---

## 9. Student Safety Safeguards

1. **Email Domain Authentication**: Hard restriction to `@kiet.edu`.
2. **Physical Student ID Verification**: Separate administrative check with "Verified Student" vs "Pending Review" badges.
3. **Private 1-to-1 Chat**: No public chatrooms. Available only to the ride host and each confirmed passenger. Disabled immediately upon cancellation.
4. **Transparent Pickup Spots**: Pre-set meeting landmarks (KIET Main Gate, Cafeteria, Library, ATM Booth, Anand Vihar Metro Exit).
5. **Women-Focused Rides**: Optional preference for female co-riders with privacy-conscious matching.
6. **1-Click Trip Sharing**: Direct itinerary share to WhatsApp or clipboard for parents, guardians, or friends.
7. **Verified Emergency Helplines**: 24/7 dialer shortcuts for KIET Security Gate (0120-2974000), UP 112, Women Helpline 1090, and Ambulance 108.
8. **Confidential Incident Reports**: Strict RBAC ensuring ordinary users never view reports, reporter identities, or private investigation notes.
