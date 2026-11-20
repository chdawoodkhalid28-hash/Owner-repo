# Implementation status

Last updated: 2026-11-20

## Neon Auth / staff CMS implementation
- Neon Managed Better Auth integrated through the Next.js same-origin auth proxy.
- Server-side session verification maps the authenticated Neon UUID to an active public.users newsroom staff record.
- Admin, Editor and Reporter roles enforced on the article API.
- Admin and Editor can read all newsroom articles and publish; Reporter sees their own articles and all their submissions are forced to draft.
- Admin-only staff API can assign a role to an existing Neon Auth account and activate/deactivate staff.
- One-time initial-admin bootstrap only accepts the configured owner email and only while public.users is empty.
- CMS UI now supports Neon Auth sign-in, account registration, initial admin bootstrap, article creation and staff-role management.
- Neon Auth trusted domain configured as https://bahawal-digital-news.vercel.app; localhost trusted domains disabled.
- Vercel encrypted variables NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET configured.
- Next.js 16.3.6 and React 19.3.0 used to satisfy Neon Auth adapter peer requirements.

## Deployment and live checks
- Production deployment: READY.
- Deployment ID: dpl_4LZZdQEFg2U2sNFjHcpTGtF8ps9V
- Commit: d90a7e28d39b9177874e611189a0e68a822dcf2e
- Admin page /admin loads the Neon Auth sign-in screen.
- /api/auth/get-session returns null when signed out (expected).
- /api/admin/me returns HTTP 401 when signed out (expected).
- /api/admin/articles returns HTTP 401 when signed out (expected).
- Database still contains 14 categories, 0 articles and 0 staff users. No sample or invented news has been added.
- Initial owner account is not yet provisioned. Owner email is required to set BDN_BOOTSTRAP_ADMIN_EMAIL; then the owner must register/sign in and initialize the first admin.

## Remaining before calling authentication complete
- Configure the owner's exact email as BDN_BOOTSTRAP_ADMIN_EMAIL in Vercel.
- Owner creates/signs in to that Neon Auth account and initializes the first admin.
- Verify authenticated session persistence, bootstrap succeeds, admin staff listing works, and admin/editor/reporter permission boundaries are enforced.
- Disable public self-signup after the first admin has been successfully created.
- Remove the deprecated BDN_ADMIN_TOKEN environment variable only after the new CMS has passed authenticated end-to-end testing.

## Further CMS production work
- Article edit/delete and scheduling; media uploads; category/tag management; comments moderation; audit workflows.
- Rate limiting, security headers, sanitization, automated tests and accessibility checks.
- Configure custom SMTP and verify newsletter delivery; current newsletter endpoint stores subscriptions only.
- Monitoring and production operational checks.

## Important
- Keep DATABASE_URL and NEON_AUTH_COOKIE_SECRET private.
- Publish only verified reporting with source attribution and editorial review.
- Production: https://bahawal-digital-news.vercel.app
- Admin: https://bahawal-digital-news.vercel.app/admin
- Canonical GitHub folder: https://github.com/chdawoodkhalid28-hash/Owner-repo/tree/main/Bahawal%20Digital%20News
- Vercel: https://vercel.com/chdawoodkhalid28-5713/bahawal-digital-news
