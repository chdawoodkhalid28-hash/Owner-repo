# BDN implementation status

Last archived work: 2026-11-20.

## Saved in this repository
- Project README and setup notes
- Next.js package manifest
- Environment variable template (no secrets)
- Git ignore rules

## Implemented locally but not yet committed here
- Public bilingual news homepage and layout
- Article detail and district pages
- Neon news and newsletter API routes
- Admin newsroom dashboard
- Admin article list/create API

The corresponding source bundle is `bahawal-digital-news-cms-stage.zip` in the ChatGPT project handoff. The source files still need to be added to this repository before it is a complete source-of-truth checkout.

## Current integration state
- Neon database schema exists and was inspected.
- Production database connection string and admin token have not been configured in Vercel.
- Neon Auth session-based staff login is not yet integrated into the CMS.
- Production deployment and end-to-end publishing tests are pending.
- Do not commit credentials or real news placeholders.
