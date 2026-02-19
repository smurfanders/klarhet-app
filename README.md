# Klarhet

> Send recruiters a two-minute feedback form after an interview. Klarhet helps you collect anonymous, structured feedback and view it in a private dashboard.

Self-hosted. Open source. Your data stays on your server.

---

## Features

- Smart conditional questions — follow-up fields only appear when relevant
- Bilingual — English and Swedish supported; easy to add more
- One response per link — duplicate submissions are blocked at both app and database level
- Dashboard with stats — avg rating, response rate, rejection reason breakdown, re-consideration rate
- Personal links — pre-filled with company, role, and language
- Lightweight — single Node.js process, SQLite-backed

---

## Self-hosting

Klarhet is designed for a single user's job search. It runs on inexpensive infrastructure and keeps all data local.

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

Edit `.env.local` and set at minimum:

- `AUTH_SECRET` — a strong secret used to sign auth tokens (32+ random chars)
- `SETUP_KEY` — a short code you will use to create the initial owner account

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000/setup` in your browser and create the owner account using the `SETUP_KEY` you chose. That setup route locks itself once an account exists. Then log in at `/login`.

---

## Tech stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router)                                       |
| Language   | TypeScript                                                    |
| UI         | React 19 (App Router + server components)                     |
| Database   | SQLite via Node.js built-in `node:sqlite`                     |
| Auth       | HMAC-signed token stored in HttpOnly cookie (`klarhet_token`) |
| Passwords  | `bcryptjs`                                                    |
| Validation | `zod`                                                         |

Notes:

- The app previously used `iron-session`; it now uses a stateless HMAC-signed token (`klarhet_token`) for server-side verification and a small readable cookie `klarhet_logged_in` for middleware UX only.

---

## Project structure

```text
klarhet/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/            ← login, logout, one-time setup
│   │   │   ├── applications/    ← create + list feedback links
│   │   │   ├── dashboard/       ← stats + application list
│   │   │   ├── form/[token]/    ← public form metadata + submit
│   │   │   └── responses/       ← fetch response for an application (owner-only)
│   │   ├── dashboard/page.tsx
│   │   ├── f/[token]/page.tsx   ← recruiter-facing form
│   │   ├── login/page.tsx
│   │   ├── setup/page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── db.ts                ← SQLite connection + schema
│   │   ├── session.ts           ← token helpers (create/verify token)
│   │   ├── rate-limit.ts
│   │   ├── types.ts
│   │   └── validation.ts
│   └── middleware.ts            ← lightweight redirect guard using readable cookie
├── .env.example
├── .gitignore
├── next.config.js
└── README.md
```

---

## Security

| Concern           | Approach                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Auth              | HMAC-signed token in an HttpOnly cookie (`klarhet_token`); middleware uses a non-HttpOnly `klarhet_logged_in` flag for UX redirects |
| Passwords         | bcrypt (never store plaintext)                                                                                                      |
| Input validation  | `zod` schemas on API routes                                                                                                         |
| Rate limiting     | IP-based throttle with hashed IPs                                                                                                   |
| Double submission | Unique DB constraint + app-level check                                                                                              |
| Secrets           | `.env.local` and `klarhet.db` are in `.gitignore`                                                                                   |

---

## API contract (current)

When creating a new application link, the API returns a canonical `data.link` field.

### `POST /api/applications`

Success response (`201`):

```json
{
  "data": {
    "id": "...",
    "company": "...",
    "role": "...",
    "language": "en",
    "token": "...",
    "interview_date": "2026-02-19",
    "created_at": "...",
    "link": "https://your-domain/f/<token>"
  },
  "error": null
}
```

Notes:

- `link` is the only documented URL field for newly created application links.
- The link uses `NEXT_PUBLIC_APP_URL` when set; otherwise the request origin is used.

---

## Creating the owner account (quick)

1. Start the dev server and open `/setup` in your browser.
2. Use the `SETUP_KEY` from your `.env.local` to create the initial owner account.

If you prefer script-driven setup, you can insert a user directly into the `user` table using the `src/lib/db.ts` helper in a small Node script — ask me if you want that helper created.

---

## License

MIT
