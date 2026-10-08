# The Plug — Closed-Loop Alumni Network & Skill Intelligence Platform

An ultra-modern, dark glassmorphic web application connecting **Students**, **Alumni**, **Faculty**, **Institutions**, and **Industry** through real-time skill telemetry, job referrals, and 1-on-1 mentorship.

---

## 🌟 Key Features

- **Dark Glassmorphism Design System**: Built with frosted glass cards (`backdrop-blur-xl`), slate dark canvas (`#070a11`), ambient violet/cyan radial glows, and *Plus Jakarta Sans* typography.
- **5 Integrated Role Dashboards**:
  - **Student**: Skill readiness score, ranked opportunities, and alumni mentorship booking.
  - **Alumni**: Dedicated command center to post internal referral slots (Google, Microsoft, AWS, Stripe) and verify student GitHub project proofs.
  - **Faculty**: Department-level skill gap detection and intervention planning.
  - **Institution**: Campus readiness analytics, critical skill gap flags, and placement telemetry.
  - **Industry**: Verified candidate intelligence, skill match scores, and direct talent pipeline.
- **Alumni Job Referral Portal (`/alumni/referrals`)**: Alumni post internal referral slots with minimum skill readiness thresholds; students request referrals with verified project proofs.
- **1-on-1 Mentorship Inbox & Scheduler (`/alumni/mentorship`)**: Student advice queue with session status tracking (Pending, Scheduled, Completed) and Google Meet integration.
- **Connected Accounts & Live Telemetry**: Link GitHub (commits & repo sync), LeetCode (solved problems & rating), LinkedIn, Kaggle, and Google Workspace.
- **Google OAuth 2.0 Auth Flow**: Branded single sign-on experience and custom user-input profile creation.
- **Desktop Sidebar Collapse**: Responsive panel toggle for maximum screen real estate.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm / yarn / pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/rudythetechy/theplug.git
cd theplug

# Install dependencies
npm install

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Use the **Role Switcher** in the top bar to test Student, Alumni, Faculty, Institution, and Industry views.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS Variables, Glassmorphism backdrop-blur
- **Icons**: Lucide React
- **Charts**: Recharts
- **Font**: Google Font (`Plus Jakarta Sans`)

---

## 📦 Project Structure

```text
app/
├── alumni/               # Alumni directory, job referrals feed & mentorship inbox
│   ├── mentorship/       # Session scheduler & Google Meet invites
│   └── referrals/        # Internal job referral slots exchange
├── dashboard/            # Role-specific dashboards (student, alumni, faculty, etc.)
│   └── alumni/           # Dedicated Alumni Command Center
├── login/                # Google OAuth & email login
├── register/             # User onboarding & profile setup
├── profile/              # User profile settings & connected proof accounts
components/
├── shared/               # Sidebar, TopNavbar, MetricCard, RoleSwitcher, charts
└── ui/                   # Base primitives (Card, Button, Badge, Select, Input)
context/                  # RoleContext & UserProfileContext (localStorage persistence)
```

---

## 🌐 Deploy to Vercel

```bash
git add .
git commit -m "Deploy The Plug to Vercel"
git push origin main
```

Connect your GitHub repository `rudythetechy/theplug` to [Vercel](https://vercel.com/) for automatic deployments.
