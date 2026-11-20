# Implementation status

Last updated: 2026-11-20

## Implemented in source (deployment verification pending)
- Neon Managed Better Auth integration added with same-origin Next.js auth proxy and server-side session client.
- Browser auth client and CMS sign-in / account registration UI added.
- CMS API now checks Neon Auth session and maps the authenticated UUID to an active public.users staff record.
- Role-aware article access: Admin and Editor can review all articles and publish; Reporter sees and creates only their own submissions, which are forced to draft.
- Admin-only staff role API supports assigning roles to existing Neon Auth identities and activating/deactivating newsroom staff.
- One-time initial-admin bootstrap endpoint restricts the first admin to the configured owner email and only runs while the newsroom staff table is empty.
- Neon Auth trusted domain set to https://bahawal-digital-news.vercel.app; localhost origins disabled for production.
- Vercel encrypted environment variables added for NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.
- Next.js and React upgraded to versions compatible with the Neon Auth Next.js adapter.
- No real secrets committed to GitHub.

## Current verification state
- Neon production branch: Better Auth active; email/password sign-in enabled.
- Database still contains 14 categories, 0 articles and 0 staff users; no sample or invented news has been added.
- First Vercel build initially exposed a Next.js peer dependency conflict; Next.js was upgraded to 16.3.6 and React 19.3.0, and a corrected production deployment is running.
- Admin identity provisioning and live sign-in are not complete yet. The owner must provide the email address to configure as BDN_BOOTSTRAP_ADMIN_EMAIL, then create/sign in to that Neon Auth account and initialize the first admin.
- After first admin setup, public self-signup must be disabled and the CMS login, role checks and article workflow must be tested end-to-end.

## Remaining production work
- Complete corrected Vercel build and verify live /api/auth, /api/admin/me, /api/admin/articles and /api/admin/staff responses.
- Provision the owner/admin identity and disable public sign-up after bootstrap.
- Test sign-in, sign-out, session restoration, unauthorized access, admin/editor/reporter permission boundaries and article creation.
- Add article edit/delete/scheduling, media uploads, category/tag management, comments moderation and audit workflows.
- Add rate limiting, security headers, sanitization, automated tests and accessibility checks.
- Configure custom SMTP and verify newsletter delivery; current newsletter endpoint stores subscriptions only.
- Add monitoring and operational checks.

## Important
- Temporary BDN_ADMIN_TOKEN is deprecated by the new source code, but do not remove its Vercel variable until the new deployment is READY and verified.
- Keep DATABASE_URL and NEON_AUTH_COOKIE_SECRET private.
- Publish only verified reporting with source attribution and editorial review.
- Production site: https://bahawal-digital-news.vercel.app
- Admin page: https://bahawal-digital-news.vercel.app/admin
- Canonical GitHub folder: https://github.com/chdawoodkhalid28-hash/Owner-repo/tree/main/Bahawal%20Digital%20News
- Deployment dashboard: https://vercel.com/chdawoodkhalid28-5713/bahawal-digital-news
