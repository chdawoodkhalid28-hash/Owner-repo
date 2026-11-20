# Bahawal Digital News

Premium bilingual digital newsroom for Bahawalnagar district and global readers.

## Production
- Public website: https://bahawal-digital-news.vercel.app
- Owner / staff portal: https://bahawal-digital-news.vercel.app/admin
- Hosting: Vercel (Next.js App Router)
- Database: Neon PostgreSQL
- Authentication: Neon Auth / Better Auth
- Source of truth: this repository's `Bahawal Digital News/` folder
- Deployment mirror: `bahawal-digital-news/`

## Stack
- Next.js App Router, React 19 and TypeScript
- Neon PostgreSQL via `@neondatabase/serverless`
- Neon Auth via `@neondatabase/auth`
- Urdu RTL / English LTR interface
- News, district, category, media, admin and newsletter routes

## Local setup
1. Copy `.env.example` to `.env.local`.
2. Configure the required Neon database and Neon Auth environment variables from the deployment environment.
3. Install dependencies with `npm install`.
4. Run `npm run dev`; validate with `npm run build`.

Never commit `.env.local`, database URLs, auth secrets, cron secrets, or admin credentials.

## Editorial and operational status
- Public homepage, district pages, category pages, article detail route and informational pages are implemented.
- Admin UI and role-aware APIs are implemented; authenticated end-to-end tests still require the owner to sign in through the browser. Never request the owner's password in chat.
- The newsroom feed is intentionally empty until verified reporting is published. Do not create fabricated headlines or publish unverified claims.
- Newsletter subscriptions are stored in Neon; automated email delivery is not enabled until a delivery provider and credentials are configured.
- Scheduled publishing uses the configured Vercel Cron schedule. On Vercel Hobby, cron frequency is limited; current schedule is daily.
- Desktop and mobile visual QA at target viewport sizes remains an explicit release checklist item. A successful build is not proof of visual QA.
- Dependency audit during the latest build reported 6 vulnerabilities (1 low, 3 high, 2 critical); investigate and remediate with a tested dependency update before declaring security hardening complete.

## Release checklist
- [ ] Owner login and session verification
- [ ] Create / edit / publish / schedule / archive / delete article E2E tests
- [ ] Reporter / Editor / Admin permission E2E tests
- [ ] Media upload and public retrieval E2E tests
- [ ] Desktop QA at 1366, 1440 and 1920 px
- [ ] Tablet and mobile QA
- [ ] Dependency vulnerability remediation
- [ ] Rate limiting, input sanitization and security review
- [ ] Newsletter delivery provider setup and send test
- [ ] Monitoring and backup / restore validation

## Editorial policy
Publish only verified reporting with clear attribution. The empty-newsroom state is intentional until real stories are approved.
