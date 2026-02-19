# Klarhet

> Send recruiters a two-minute feedback form after an interview. Finally understand why you didn't get the job.

Recruiters send candidates feedback surveys all the time. Klarhet flips that dynamic. After an interview, you generate a personalised link from your dashboard and send it to the recruiter. They fill in a short, thoughtful form — no account required on their end. You get the answers in your dashboard.

Self-hosted. Open source. Your data stays on your server.

---

## Features

- **Smart conditional questions** — follow-up fields only appear when relevant
- **Bilingual** — each link is generated in English or Swedish; more languages easy to add
- **One response per link** — duplicate submissions are blocked at both app and database level
- **Dashboard with stats** — avg rating, response rate, rejection reason breakdown, re-consideration rate
- **Personal links** — pre-filled with company, role, and language so the recruiter sees a clean form
- **Lightweight** — SQLite database, single Node.js process, runs on any cheap server or subdomain

---

## Self-hosting

Klarhet is designed for one person's job search. The database will never be large. No cloud services, no subscriptions, no vendor lock-in.

### Requirements

- Node.js 22+
- Any Linux server, VPS, or subdomain

### First-time setup

```bash
git clone https://github.com/smurfanders/klarhet-app.git
cd klarhet-app
npm install
cp .env.example .env.local
```

Edit `.env.local` — fill in `AUTH_SECRET` (32+ random chars) and choose a `SETUP_KEY`.

```bash
npm run dev
```

Open `http://localhost:3000/setup` in your browser and create your account using the `SETUP_KEY` you chose. That route locks itself once your account exists.

Then log in at `/login` and you're in.

---

## Tech stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 14 (App Router)                   |
| Language   | TypeScript                                |
| Database   | SQLite via Node.js built-in `node:sqlite` |
| Auth       | `iron-session` (signed, encrypted cookie) |
| Passwords  | `bcryptjs` (cost factor 12)               |
| Validation | `zod`                                     |

---

## Project structure

```text
klarhet/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── setup/route.ts      ← one-time account creation
│   │   │   ├── applications/route.ts   ← create + list feedback links
│   │   │   ├── dashboard/route.ts      ← stats + application list
│   │   │   ├── form/[token]/
│   │   │   │   ├── route.ts            ← public form metadata
│   │   │   │   └── submit/route.ts     ← public form submission
│   │   │   └── responses/[applicationId]/route.ts
│   │   ├── dashboard/page.tsx
│   │   ├── f/[token]/page.tsx          ← recruiter-facing form
│   │   ├── login/page.tsx
│   │   ├── setup/page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── db.ts                       ← SQLite connection + schema
│   │   ├── session.ts                  ← iron-session config + helpers
│   │   ├── rate-limit.ts
│   │   ├── types.ts
│   │   └── validation.ts
│   └── middleware.ts                   ← auth guard
├── .vscode/settings.json
├── .env.example
├── .gitignore
├── next.config.js
└── README.md
```

---

## Security

| Concern           | Approach                                                        |
| ----------------- | --------------------------------------------------------------- |
| Auth              | Signed + encrypted session cookie via iron-session              |
| Passwords         | bcrypt with cost factor 12 — never stored in plaintext          |
| Input validation  | Zod schemas on every API route                                  |
| Rate limiting     | IP-based throttle (5/hour), IPs stored as SHA-256 hashes only   |
| HTTP headers      | X-Frame-Options, HSTS, X-Content-Type-Options on every response |
| Double submission | Unique DB constraint + app-level check                          |
| Secrets           | `.env.local` and `klarhet.db` are both in `.gitignore`          |

---

## Adding a language

1. Add the language code to the `CHECK` constraint in `src/lib/db.ts`
2. Add translation strings to `src/lib/i18n.ts`
3. Add the option to the language selector in the dashboard

---

## License

MIT
