# Implementation status

Last updated: 2026-11-20

## Neon Auth / staff CMS
- Neon Managed Better Auth is integrated through the Next.js same-origin auth proxy.
- Server-side sessions map authenticated Neon identities to active newsroom staff records.
- Admin, Editor and Reporter permissions are enforced by server APIs.
- Reporters can submit and edit their own drafts; they cannot publish or schedule.
- Admins and Editors can create, edit, publish, schedule, archive and delete articles.
- Article create, update and delete actions are recorded in the editorial activity log.
- Admin-only staff management supports role assignment and activation controls.
- Initial administrator provisioned: 1 Neon Auth account, 1 active admin staff record.
- Public self-signup is disabled after initial admin setup.
- Trusted origin is https://bahawal-digital-news.vercel.app; localhost is disabled.

## CMS milestone delivered
- Article list includes editorial status, category, language and scheduled publication time.
- Article editor supports Urdu and English headlines, summaries and body text, categories, location, source attribution and image attachment.
- Role-aware article PATCH and DELETE APIs enforce author and status restrictions.
- Media upload endpoint accepts JPEG, PNG, WebP and GIF up to 3.5 MB, restricted to Admin/Editor; files are stored in the existing media table and served through /api/media/{id}.
- Scheduled publisher endpoint requires the Vercel CRON_SECRET bearer token and publishes due articles.
- Vercel Hobby supports daily cron only, so the publisher runs daily at 00:00 UTC (05:00 Pakistan time). More frequent schedules require Vercel Pro.
- Scheduling input converts newsroom local time to UTC before saving.

## Production deployment and checks
- Production deployment: READY.
- Deployment ID: dpl_33PQZ9eSLikkddk17fJ7XjZda2hQ
- Commit: db50199fcb38546a34d1c132209e8f1cbe6d2e0d
- Live site: https://bahawal-digital-news.vercel.app
- Admin page: https://bahawal-digital-news.vercel.app/admin
- Production build and TypeScript checks completed successfully.
- Build output confirms routes /api/admin/articles, /api/admin/articles/[id], /api/admin/media, /api/media/[id], and /api/cron/publish.
- Live admin page loads the Neon Auth sign-in screen.
- Signed-out /api/admin/me and /api/admin/articles return HTTP 401 (expected).
- Signed-out /api/cron/publish returns HTTP 401 (expected).
- Authenticated browser E2E checks for session persistence, article CRUD, media upload and role boundaries remain pending; no BDN-signed-in browser profile is available in the current browser context.
- No sample or invented news has been published.

## Remaining verification / production tasks
- Complete authenticated browser E2E checks after a BDN browser profile is signed in.
- Test a real image upload and media retrieval, and a scheduled publish using a non-public test article.
- Consider Vercel Pro if near-real-time scheduled publishing is required.
- Remove deprecated BDN_ADMIN_TOKEN only after authenticated end-to-end checks pass.
- Configure custom SMTP and verify newsletter delivery; current newsletter endpoint stores subscriptions only.
- Continue security hardening, rate limiting, accessibility checks, monitoring and automated tests.

## Security and editorial notes
- Keep DATABASE_URL, NEON_AUTH_COOKIE_SECRET, CRON_SECRET and all tokens private.
- Publish only verified reporting with source attribution and editorial review.
- Canonical GitHub folder: https://github.com/chdawoodkhalid28-hash/Owner-repo/tree/main/Bahawal%20Digital%20News
- Deployment source folder: https://github.com/chdawoodkhalid28-hash/Owner-repo/tree/main/bahawal-digital-news
- Vercel: https://vercel.com/chdawoodkhalid28-5713/bahawal-digital-news
