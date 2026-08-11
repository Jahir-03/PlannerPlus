# PlannerPlus — DSA Operations & Student Organization Management Ecosystem

**PlannerPlus** is an enterprise-grade digital operating system designed for university **Directorate of Student Affairs (DSA)** administrators, student leadership, clubs, core domains, committee heads, and volunteers.

---

## 🌟 Key Features

* **Scope-Aware RBAC Engine**: Evaluates permissions via `User + Role + Organization + Scope` memberships across **20 Cultural Clubs** and **13 Core Administrative Domains**.
* **Enterprise Task Engine**: Kanban workflow board with task creation, priority metrics (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), assignees, and real-time status transitions.
* **Event Operations Engine**: Project lifecycle management (`DRAFT` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `PREPARATION` $\rightarrow$ `EXECUTION`).
* **Multi-Stage Approval Workflows**: Sequenced decision chains for event proposals, budget requests, and equipment bookings with audit logging.
* **Conflict-Free Resource Inventory**: Dynamic time-window overlap checking for venues, sound rigs, cameras, and stage furniture.
* **Permission-Aware AI Operations Assistant**: Contextual Q&A chat and AI Meeting Summarizer auto-extracting key decisions and action items.

---

## 🏛️ Organizational Architecture

### 20 Cultural Clubs
Music • MAD • Gaming • Astrophilia • Women Empowerment • Rotaract • Literary • Festival • Social • Jatt Squad • Team Energix • Sign4Dance • Advaya • Crew616 • Self Defence • Fashion • Creative Arts • Dance • Movies & Dramatics • Quiz

### 13 Core Administrative Domains
Treasurer • Social Media • Transportation & Accommodation • Public Relations • Media • Publicity & Content • Emcee • Tech & Graphic Design • Operations & Resource Management • Certificate & Prize Distribution • Sponsorship • Discipline • Hospitality

---

## 🚀 Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query
* **Backend**: Node.js, Express.js, TypeScript Modular Monolith
* **Database & ORM**: PostgreSQL / SQLite, Prisma ORM
* **Security**: JWT Access & Refresh Tokens, bcrypt password hashing, Scoped RBAC Middleware, Zod Validation, Helmet

---

## 💻 Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration & Seeding
```bash
npm run prisma:db-push
npm run seed
```

### 3. Start Development Servers
```bash
# Start backend API (Port 5000) and frontend Vite dev server (Port 3000)
npm run dev
```

---

## 🧪 Testing

```bash
npm test
```
