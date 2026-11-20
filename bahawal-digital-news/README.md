# Bahawal Digital News — source workspace

Premium bilingual digital newsroom for Bahawalnagar district and global readers.

## Stack
- Next.js App Router, React and TypeScript
- Neon PostgreSQL via @neondatabase/serverless
- Urdu RTL / English LTR frontend
- Published-news and newsletter API routes
- Initial admin article API and CMS prototype

## Local setup
1. Copy .env.example to .env.local.
2. Set DATABASE_URL to the Neon bahawal_news database connection string.
3. Set BDN_ADMIN_TOKEN to a long random secret (temporary prototype gate).
4. Run npm install, then npm run dev.

## Security status
The current CMS token gate is a prototype, not final staff authentication. Before production, replace it with Neon Auth session verification and role checks against public.users. Never commit .env.local or real credentials.

## Editorial policy
The homepage intentionally displays an empty newsroom state until verified reporting is published. Do not create fabricated headlines or publish unverified claims.

## Current scope
Configuration, root layout, news feed API, newsletter API, and initial token-gated admin articles API have been committed. Remaining frontend pages/styles and CMS UI should be committed in subsequent implementation updates. Deployment and live integration are separate from source archival.
