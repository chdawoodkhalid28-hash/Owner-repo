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


## Owner dashboard upgrade — 20 November 2026
- Reworked `/admin` into an owner/editor control center while preserving Neon Auth sign-in and existing article/staff APIs.
- Added live summary cards for total, published, draft and scheduled articles; admin-only active staff count; refresh and public-site shortcuts.
- Added in-page navigation to create news, manage articles and staff permissions.
- Added article search and status filtering. Dashboard remains responsive on mobile.
- Source mirrored in both `Bahawal Digital News/` and `bahawal-digital-news/`.
- GitHub mirror source commit: `adc198d4fc3de42d0578fbc5271819855c3825f7`.
- Production deployment requested: `dpl_CZqbbhB4dH2cgGqudSg3CkNopXhi`; build was still running at the time of this status update, so production availability is not yet confirmed.

## Production accessibility update — 20 November 2026
- Vercel project SSO protection was restricted to Preview deployments; Production aliases are now public while Preview deployments remain protected.
- Re-verified `https://bahawal-digital-news.vercel.app/` returns HTTP 200 and renders the Urdu RTL homepage.
- Re-verified `https://bahawal-digital-news.vercel.app/admin` returns HTTP 200 and renders the staff sign-in screen.
- The production deployment remains `dpl_5AiRho1QyAjGDhqFjjTBrkFXpAoY` (`READY`, commit `989c1e54245617c5a689b0866a2acab0f6a6f7d9`).
- Vercel runtime error scan for the last 7 days returned no runtime errors.
- Authenticated CMS E2E remains unverified because it requires the owner to sign in interactively; no password is requested or stored in chat.


## Quality assurance update — 21 November 2026
- Added GitHub Actions CI for push and pull-request changes under bahawal-digital-news: npm install, npm audit, TypeScript check and production build.
- Clean dependency install verification passed; npm audit reported 0 vulnerabilities; TypeScript and production build passed.
- Production HTTP checks: homepage and /admin return 200; signed-out /api/admin/me, /api/admin/articles and /api/cron/publish return 401; /api/news, robots.txt and sitemap.xml return 200.
- Browser QA at 1440px desktop and 390px mobile confirmed no horizontal overflow, sticky masthead remains at viewport top while scrolling, portrait image loads, and no browser console/page errors were recorded.
- Production Vercel runtime error scan (24h) returned no runtime errors.
- Remaining owner-assisted checks: authenticated login/OTP/password reset, article CRUD, real media upload and scheduled publish; configure SMTP for newsletter delivery; review non-blocking Better Auth peer dependency warnings and Vercel environment-variable security flags. Do not remove deprecated BDN_ADMIN_TOKEN until authenticated E2E passes.
