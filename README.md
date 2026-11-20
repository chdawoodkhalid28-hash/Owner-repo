# Bahawal Digital News (BDN)

Premium Urdu-first digital newsroom for Bahawalnagar District, Pakistan.

## Project status

This repository is the project handoff/archive location. The current implementation work includes:
- Next.js App Router public news frontend (Urdu RTL / English LTR)
- Neon Postgres-backed published news feed and newsletter API routes
- Article detail and district pages
- Initial admin newsroom dashboard and article composer
- Protected admin article API using a server-side environment token
- Existing Neon schema for articles, categories, staff roles, media, comments, advertisements, and newsletter subscribers

## Important deployment notes

The CMS integration is not yet production-deployed or end-to-end verified. Configure secrets only in the hosting provider's environment settings; never commit `.env` files or credentials.

Required environment variables are documented in `.env.example`:
- `DATABASE_URL`
- `BDN_ADMIN_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

Install and run locally:

```bash
npm install
npm run dev
```

## Editorial integrity

Do not create fabricated headlines or sample news stories. Keep the public newsroom empty until verified reporting is published.

## Current limitations

- Secure Neon Auth session integration and staff role mapping remain to be completed.
- Admin publishing workflow requires deployment configuration and end-to-end testing.
- Vercel deployment quota previously blocked a new production deployment.
