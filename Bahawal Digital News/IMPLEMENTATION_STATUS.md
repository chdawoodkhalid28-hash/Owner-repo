# Implementation status

Last updated: 2026-11-20

## Committed
- Next.js package manifest and config
- Environment variable template (no secrets)
- Git ignore rules
- Urdu RTL root layout and metadata
- Published articles feed API
- Newsletter subscription API
- Initial admin articles GET/POST API (temporary token gate)
- Project setup and security notes

## Not yet committed
- Homepage UI and global styles
- Admin CMS page
- Article detail and district pages
- Database schema/migrations and automated tests

## Known limitations
- Admin token gate is temporary and not equivalent to Neon Auth role-based authentication.
- Production environment variables are not stored in GitHub.
- Dynamic Vercel deployment was blocked by the provider's daily deployment quota in the previous implementation session; do not describe the dynamic frontend as live until redeployed and tested.
- The earlier static deployment URL is https://bahawal-digital-news.vercel.app; current dynamic backend integration is not confirmed live.

## Editorial safeguards
No sample or invented news articles are inserted. Publish only verified reporting with appropriate attribution.
