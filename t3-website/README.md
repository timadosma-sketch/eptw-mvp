# T3 Solutions — Enterprise Corporate Website

A premium, enterprise-focused corporate website for **T3 Solutions**, built as a
**data-driven static site generator**. Services, industries, insights, navigation, SEO and
contact details live in editable data files — non-developers change content without touching
templates, and `npm run build` regenerates the whole site.

> Positioning: *an enterprise technology and digital transformation partner helping
> organisations in Qatar and the GCC modernise, integrate, automate and scale.*

## Quick start
```bash
cd t3-website
npm run build     # generates ./dist  (zero dependencies, Node 18+)
npm run serve     # build + preview at http://localhost:4700
```

## Structure
```
t3-website/
├── build.mjs                 # generator → ./dist
├── src/
│   ├── data/                 # ← EDIT CONTENT HERE
│   │   ├── site.mjs          # brand, nav, footer, contact, GOVERNANCE FLAGS
│   │   ├── services.mjs      # capabilities → /services/<slug>/
│   │   ├── industries.mjs    # sectors → /industries/<slug>/
│   │   ├── content.mjs       # homepage narrative (outcomes, why, approach, solutions)
│   │   └── insights.mjs      # knowledge-centre topics & pillar plan
│   ├── lib/                  # components, layout, SEO/JSON-LD, icons (templates)
│   └── styles/styles.css     # design system
├── assets/                   # logo, favicons
└── dist/                     # generated output (deploy this)
```

## Content governance
Unverified proof (client logos, partner status, testimonials, case studies, certifications,
leadership, analytics) is **gated behind flags** in `src/data/site.mjs → flags` and stays off
until approved. See **`WEBSITE_CONTENT_APPROVAL_CHECKLIST.md`**.

## Deploy (Vercel)
The included `vercel.json` builds the site and serves `dist`:
- Framework preset: **Other**
- Build command: `node build.mjs`
- Output directory: `dist`

Or any static host: run `npm run build` and upload `./dist`.

## Documentation
- `WEBSITE_CONTENT_APPROVAL_CHECKLIST.md` — everything management must verify before launch.
- `SEO_CONTENT_ROADMAP.md` — keyword themes, content clusters, technical SEO, 3/6-month plan.
- `WEBSITE_IMPLEMENTATION_REPORT.md` — audit, decisions, IA, SEO, a11y, security, risks.

## Notes
- Contact form uses a mailto handoff by default; a CRM/endpoint integration point is marked in the
  generated `app.js`.
- `/ar/` is an RTL "in preparation" placeholder — full Arabic requires professional translation.
