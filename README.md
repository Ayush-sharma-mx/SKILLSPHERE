# SkillSphere 🌐
### AI-Powered Hyperlocal Freelance Ecosystem

> A production-ready MERN stack platform connecting clients with skilled freelancers through intelligent job matching, secure escrow payments, real-time collaboration, and smart reputation management.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Multi-Role Auth** | JWT + Google OAuth + Email Verification + 2FA (TOTP) |
| 🤖 **AI Job Matching** | Hugging Face `all-MiniLM-L6-v2` semantic embeddings with cosine similarity |
| 💬 **Real-Time Chat** | Socket.IO with typing indicators, file sharing, read receipts |
| 💳 **Secure Payments** | Razorpay escrow + milestone-based releases + refund management |
| ⭐ **Smart Reviews** | Heuristic fake-review detection + weighted reputation scoring |
| 📊 **Admin Dashboard** | Platform analytics, user management, dispute resolution |
| 🔔 **Notifications** | Real-time in-app + email notifications |
| 📅 **Scheduler** | Freelancer availability calendar |
| ⚖️ **Disputes** | Evidence upload + admin mediation + resolution tracking |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB Atlas + Mongoose ODM
- **Auth**: JWT + Passport.js (Google OAuth) + Speakeasy (2FA)
- **Real-Time**: Socket.IO
- **File Storage**: Cloudinary (Multer)
- **Email**: Nodemailer (Gmail SMTP)
- **Payments**: Razorpay
- **AI**: Hugging Face Inference API (`sentence-transformers/all-MiniLM-L6-v2`)

### Frontend
- **Framework**: React 18 + Vite
- **State**: Redux Toolkit + React Query
- **Styling**: TailwindCSS (dark theme)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Heroicons

---

## 📁 Project Structure

```
SKILLSPHERE/
├── server/                    # Express API Server
│   ├── config/                # DB, Cloudinary, Passport
│   ├── controllers/           # 11 route controllers
│   ├── middleware/            # Auth, Error, Upload, RateLimit
│   ├── models/                # 11 Mongoose models
│   ├── routes/                # 11 API route files
│   ├── services/              # AI, Payment, Email, Review
│   ├── socket/                # Socket.IO handler
│   ├── utils/                 # Token, Email, Validators
│   ├── .env.example           # Environment template
│   └── index.js               # App entry point
│
├── client/                    # React Vite App
│   └── src/
│       ├── app/               # Redux store
│       ├── components/        # Shared UI components
│       ├── features/          # Redux slices
│       ├── hooks/             # Custom hooks
│       ├── pages/             # All route pages
│       ├── services/          # Axios API + Socket
│       └── utils/             # Helpers, constants
│
├── package.json               # Root concurrent scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Razorpay account (test mode)
- Google Cloud Console project (OAuth)
- Hugging Face account (free API key)
- Gmail account with App Password

### 1. Clone & Install

```bash
# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure Environment

```bash
# Copy the example env file
cp server/.env.example server/.env
```

Edit `server/.env` and fill in:

| Variable | How to Get |
|---|---|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `JWT_SECRET` | Any random 64-char string |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com) → APIs → Credentials |
| `EMAIL_USER/PASS` | Gmail + [App Password](https://myaccount.google.com/apppasswords) |
| `CLOUDINARY_*` | [Cloudinary Dashboard](https://cloudinary.com/console) |
| `RAZORPAY_KEY_ID/SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys |
| `HUGGING_FACE_API_KEY` | [HuggingFace](https://huggingface.co/settings/tokens) → New Token |

### 3. Run Development Servers

```bash
# Starts both frontend (port 5173) and backend (port 5000) concurrently
npm run dev
```

Or run individually:
```bash
npm run dev:server   # Backend only → http://localhost:5000
npm run dev:client   # Frontend only → http://localhost:5173
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (client/freelancer) |
| POST | `/api/auth/login` | Login with JWT |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/enable-2fa` | Generate 2FA QR |
| POST | `/api/auth/verify-2fa` | Enable 2FA |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Browse projects (with filters) |
| POST | `/api/projects` | Create project (client) |
| GET | `/api/projects/:id` | Project detail |
| PATCH | `/api/projects/:id/milestone` | Update milestone status |

### AI Matching
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/freelancers/ai-match/:projectId` | Get AI-ranked freelancers |

### Payments (Razorpay)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| POST | `/api/payments/release/:id` | Release escrow to freelancer |

> Full API docs available in each route file with inline comments.

---

## 🤖 AI Matching System

The AI matching uses **Hugging Face Inference API** with the `sentence-transformers/all-MiniLM-L6-v2` model:

1. **Embedding Generation**: When a project is created, required skills are converted to a text embedding vector and stored in MongoDB
2. **Freelancer Embeddings**: When a freelancer updates their skills, their skill embedding is regenerated
3. **Semantic Matching**: Cosine similarity is computed between project and freelancer embeddings
4. **Composite Score**:
   - 60% — Semantic skill similarity
   - 20% — Average rating (normalized)
   - 10% — Completed projects (normalized)
   - 10% — Availability bonus
5. **Fallback**: If HF API is unavailable, keyword intersection similarity is used

---

## 💳 Payment Flow (Razorpay Escrow)

```
Client creates milestone payment
        ↓
POST /api/payments/create-order  →  Razorpay Order Created
        ↓
Razorpay Checkout opens in browser
        ↓
Payment captured by Razorpay
        ↓
POST /api/payments/verify  →  Signature verified (HMAC-SHA256)
        ↓
Payment held in ESCROW (escrowHeld: true)
        ↓
Freelancer completes milestone
        ↓
POST /api/payments/release/:id  →  Escrow released
        ↓
Freelancer totalEarnings updated
```

---

## 🔐 User Roles & Permissions

| Action | Client | Freelancer | Admin |
|---|---|---|---|
| Create Project | ✅ | ❌ | ✅ |
| Submit Proposal | ❌ | ✅ | ❌ |
| Accept Proposal | ✅ | ❌ | ✅ |
| Release Payment | ✅ | ❌ | ✅ |
| Verify Freelancer | ❌ | ❌ | ✅ |
| Resolve Dispute | ❌ | ❌ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ |
| AI Match Freelancers | ✅ | ❌ | ✅ |

---

## 🧪 Demo Credentials

After seeding (see seed script), use:
- **Admin**: `admin@skillsphere.com` / `Admin@123`
- **Client**: `client@demo.com` / `Demo@123`
- **Freelancer**: `freelancer@demo.com` / `Demo@123`

---

## 📦 Database Collections

| Collection | Documents |
|---|---|
| `users` | Auth info, roles, 2FA |
| `freelancerprofiles` | Skills, portfolio, embeddings |
| `clientprofiles` | Company, stats |
| `projects` | Gigs, milestones, embeddings |
| `proposals` | Bids, cover letters |
| `conversations` | Chat rooms |
| `messages` | Chat messages |
| `payments` | Razorpay transactions |
| `reviews` | Ratings, fake scores |
| `notifications` | Real-time alerts |
| `disputes` | Conflict resolution |

---

## 🏆 Technical Highlights

- **MERN Stack** with clean separation of concerns
- **JWT + RBAC** for stateless, role-based auth
- **Socket.IO rooms** for real-time chat and notifications
- **Hugging Face AI** for semantic freelancer matching
- **Razorpay Escrow** for secure, trustless payments
- **Cloudinary CDN** for portfolio/resume file storage
- **MongoDB Aggregation** for admin analytics
- **Rate Limiting** and **Helmet** for security
- **Nodemailer HTML** emails with branded templates
- **Heuristic Fake Review Detection** for review integrity

---

## 📄 License

MIT © 2024 SkillSphere
