# Bahawal Digital News

Premium bilingual digital newsroom for Bahawalnagar district and global readers.

## Production
- Public website: https://bahawal-digital-news.vercel.app
- Owner / staff portal: https://bahawal-digital-news.vercel.app/admin
- Hosting: Vercel (Next.js App Router)
- Database: Neon PostgreSQL
- Authentication: Neon Auth / Better Auth
- Source of truth: this repository's `Bahawal Digital News/` folder
- Vercel is not Git-connected to this repository yet; production deployments are currently triggered explicitly from the GitHub source rather than automatically on every push.
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

## Official About Us / Introduction

### Bahawal Digital News — Tribute, Introduction and Mission

Bahawal Digital News (BDN) is a digital news organization established to preserve Bahawalpur's historical, cultural, social and journalistic identity, amplify the public voice, and deliver news from across the Bahawalpur Division through modern digital media.

The institution is connected with the region's historic heritage, traditions, culture and spirit of public service. Bahawalpur is more than a city or geographical region; it represents history, learning, hospitality, courage, traditions and cultural distinction.

### Tribute to Nawab Sir Sadiq Muhammad Khan Abbasi V

Bahawal Digital News pays tribute to Nawab Sir Sadiq Muhammad Khan Abbasi V, the last ruler of the former State of Bahawalpur, and honors his historical legacy and services. His era is remembered for the state's identity, institution-building, education, public welfare and development traditions. During the early years of Pakistan, the State of Bahawalpur and the Nawab's contributions also held significance in the country's history.

BDN commits to helping preserve and share Bahawalpur's history, culture, notable personalities, educational traditions and public-service legacy with future generations.

### Coverage — The Entire Bahawalpur Division

BDN is not limited to Bahawalpur city. Its coverage scope includes Bahawalpur, Bahawalnagar and Rahim Yar Khan, with attention to cities, towns, villages and rural communities. Coverage topics include public affairs, administration, politics, education, health, business, agriculture, sports, culture, crime, traffic, civic services, development and other important local matters. We aim to make space for smaller communities and voices that are often overlooked.

### Editorial Commitment

Our principles are responsible, impartial, dignified and public-interest journalism. We distinguish news from opinion, verify information, seek relevant perspectives, prioritize facts over sensationalism, and avoid publishing unverified allegations. Where appropriate, we seek the response of the person or institution concerned.

### Mission

To inform people across Bahawalpur Division, bring public issues to relevant attention, strengthen civic awareness, encourage positive community activity and present the region's historical and cultural identity responsibly. We aim to make accurate, timely and relevant information accessible to every resident.

### Vision

To become a trusted, modern, effective and community-focused digital news platform for Bahawalpur Division—building public trust through journalistic standards, regional identity and digital innovation.

**Bahawal Digital News — Connected to history, the voice of the people, committed to truth.**

*Our identity is Bahawalpur, our purpose is public service, and our principle is truth.*

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

### Production access verification
- Vercel Authentication is limited to Preview deployments; Production aliases are public.
- Homepage and `/admin` both returned HTTP 200 in the latest verification.
- The last 7-day Vercel runtime error scan was clean.
- Authenticated CMS workflows still require owner sign-in and hands-on verification.
