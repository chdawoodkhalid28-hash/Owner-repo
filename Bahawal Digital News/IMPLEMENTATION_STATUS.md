# Implementation status

Last updated: 2026-11-20

## Neon Auth / staff CMS implementation
- Neon Managed Better Auth integrated through the Next.js same-origin auth proxy.
- Server-side session verification maps authenticated Neon identities to active newsroom staff records.
- Admin, Editor and Reporter roles are enforced on article APIs.
- Admin and Editor can manage newsroom content; Reporter submissions are forced to draft.
- Admin-only staff API supports role assignment and activation controls.
- One-time initial-admin bootstrap is restricted to the configured owner email and an empty staff table.
- CMS UI supports Neon Auth sign-in, registration (now closed after bootstrap), initial admin setup, article creation and staff management.
- Neon Auth trusted origin is https://bahawal-digital-news.vercel.app; localhost is disabled.
- Vercel encrypted auth environment variables and BDN_BOOTSTRAP_ADMIN_EMAIL are configured.
- Next.js 16.3.6 and React 19.3.0 satisfy Neon Auth adapter requirements.

## Production deployment and verification
- Production deployment: READY.
- Deployment ID: dpl_2EsufUJJASLyTLYDxXeU9MV415Zm
- Commit: 5551df3409c31493502d254c357e2b22b4da6323
- Live site: https://bahawal-digital-news.vercel.app
- Admin page: https://bahawal-digital-news.vercel.app/admin
- Admin page loads and shows Neon Auth sign-in.
- /api/auth/get-session returns null when signed out (expected).
- /api/admin/me and /api/admin/articles return HTTP 401 when signed out (expected).
- Neon database verification: 1 auth account, 1 staff record, 1 active administrator, 0 articles.
- Public self-signup has been disabled after initial admin provisioning.
- No sample or invented news has been published.

## Remaining authentication verification
- Authenticated browser-session persistence and admin API access still require a signed-in browser E2E check.
- Verify staff listing and Admin/Editor/Reporter permission boundaries with test accounts before removing deprecated BDN_ADMIN_TOKEN.
- Keep public self-signup disabled; create additional staff accounts through the controlled admin workflow.

## Further CMS production work
- Article editing/deletion and scheduling; media uploads; category/tag management; comment moderation; audit workflows.
- Rate limiting, security headers, sanitization, automated tests and accessibility checks.
- Configure custom SMTP and verify newsletter delivery; current newsletter endpoint stores subscriptions only.
- Monitoring and production operational checks.

## Security and editorial notes
- Keep DATABASE_URL, NEON_AUTH_COOKIE_SECRET and all tokens private.
- Publish only verified reporting with source attribution and editorial review.
- Canonical GitHub folder: https://github.com/chdawoodkhalid28-hash/Owner-repo/tree/main/Bahawal%20Digital%20News
- Vercel: https://vercel.com/chdawoodkhalid28-5713/bahawal-digital-news
