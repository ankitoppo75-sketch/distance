# Distance Pathways

A full-stack MERN application for **Distance Pathways**, an edtech platform that helps students of distance
universities (IGNOU, DU SOL, Amity Online, etc.) with:

- Subject-wise **recorded video lectures** (free + paid)
- **Notes** and **previous year question papers** (PDF downloads, free + paid)
- **Synopsis / project / research paper writing help** (custom quote → pay → delivery)
- An **admin panel** to manage branding (logo), global feature toggles, user roles, per-teacher
  permissions, per-student feature restrictions, and project requests
- **Razorpay** checkout supporting **Card, UPI, Netbanking and Wallets**, with a separate
  hand-to-hand payment for each individual course/video/notes/paper/project service

---

## Tech stack

- **Frontend:** React 18 + Vite + React Router + Tailwind CSS + Framer Motion + lucide-react
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Payments:** Razorpay Checkout (Card / UPI / Netbanking / Wallets)
- **Auth:** JWT (JSON Web Tokens)

---

## Project structure

```
distance-pathways/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Course, Content, ProjectRequest, Order, Settings
│   ├── middleware/                # auth (JWT, roles, feature/permission checks), error handler
│   ├── routes/                    # auth, courses, content, project-requests, payments, admin, settings
│   ├── utils/                     # razorpay client, multer upload, JWT helper, seed script
│   ├── uploads/                   # logo / thumbnails / documents / avatars (served at /uploads)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js           # axios instance with auth header
    │   ├── context/               # AuthContext, SettingsContext (branding/feature flags)
    │   ├── components/            # Navbar, Footer, CourseCard, ContentCard, PathwaySteps, etc.
    │   ├── pages/                 # Home, Login, Register, Courses, CourseDetail, Library,
    │   │                           ProjectHelp, Dashboard, TeacherStudio, AdminPanel, NotFound
    │   ├── utils/payment.js       # Razorpay checkout helper (per-item payment)
    │   └── App.jsx
    ├── index.html
    └── tailwind.config.js
```

---

## Getting started

### 1. Prerequisites

- Node.js 18+
- A MongoDB database (local `mongod` or MongoDB Atlas)
- A [Razorpay](https://razorpay.com) account (test mode keys are fine for development) - this gives
  you Card, UPI, Netbanking and Wallet payments out of the box.

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, and Razorpay keys
npm install
npm run seed    # creates a default admin, a sample teacher, and a sample course
npm run dev     # starts the API on http://localhost:5000
```

Default seeded accounts:

| Role    | Email                          | Password     |
|---------|---------------------------------|---------------|
| Admin   | admin@distancepathways.com      | Admin@123     |
| Teacher | teacher@distancepathways.com    | Teacher@123   |

> The seeded teacher account has **no permissions enabled by default**. Log in as the admin, go to
> **Admin panel → Users & permissions**, expand the teacher, and tick the permissions you want to
> grant (upload videos/notes/papers, manage courses, handle project requests).

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev     # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`, so no extra
configuration is needed in development.

### 4. Build for production

```bash
cd frontend
npm run build   # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (or have the Express server serve it), and point
`CLIENT_URL` in the backend `.env` at your deployed frontend URL.

---

## Feature mapping

| Requirement | Where it lives |
|---|---|
| YouTube-style recorded lectures, free + paid | `Content` model (`type: "video"`), `ContentCard`, `CourseDetail`, `Library` |
| Notes & previous year question papers, free + paid | `Content` model (`type: "notes" / "questionPaper"`) |
| Synopsis / project / research paper help at custom price | `ProjectRequest` model + `/project-help` page + teacher/admin "quote" flow |
| Pay per individual service (hand-to-hand payment) | `/api/payments/create-order` + `/api/payments/verify` - one Razorpay order per item (course, video, notes, paper, or project request) |
| Card / UPI / other payment methods | Razorpay Checkout (`method: { card, upi, netbanking, wallet }` in `src/utils/payment.js`) |
| Admin can change the app logo | Admin panel → Branding → "Upload new logo" (`PUT /api/admin/settings/logo`) |
| Admin can restrict a feature to a specific teacher | Admin panel → Users & permissions → expand a teacher → toggle `teacherPermissions` (`canUploadVideos`, `canUploadNotes`, `canUploadQuestionPapers`, `canManageCourses`, `canManageProjectRequests`) |
| Admin can restrict a feature for a specific student | Admin panel → Users & permissions → expand a student → toggle `restrictedFeatures` (video library, notes, question papers, project services, live classes, course enrollment) |
| Global feature on/off switches | Admin panel → Feature access tab (`Settings.featureFlags`) |

---

## Notes on payments

Each purchasable item (a paid course, a single video/notes/question paper, or a quoted
project/synopsis/research request) creates its **own Razorpay order** via
`POST /api/payments/create-order`. After the user completes payment, the frontend calls
`POST /api/payments/verify`, which checks the Razorpay signature and then:

- Adds the item to the user's `purchasedContent` list (unlocking it everywhere in the app), and
- For courses, adds the course to `enrolledCourses` and increments `studentsEnrolled`, and
- For project requests, marks the request as paid and moves it to `inProgress`.

This gives you the "hand-to-hand payment for each individual service" behaviour requested - students
are never forced to buy a bundle to access one resource.

---

## Design system

- **Colors:** Ink Navy (`#0F2042`), Pathway Blue (`#2A4DD0`), Signal Teal (`#13B8A6`), Amber
  (`#F5A623`), Paper background (`#F7F8FC`)
- **Fonts:** Sora (headings/display), Inter (body text), JetBrains Mono (prices, course codes,
  university tags)
- **Signature visual:** the "Pathway" motif - a dotted path connecting milestone cards
  (Watch → Revise → Write → Succeed), used on the homepage and in the hero illustration
