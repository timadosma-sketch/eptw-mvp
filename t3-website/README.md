# T3 Solutions — Corporate Website

A fast, self-contained marketing website for **T3 Solutions** (t3solutions.kz).
Built as a zero-dependency static site — plain HTML, CSS and vanilla JavaScript —
so it deploys anywhere in seconds and is trivial to move between hosts.

## Highlights

- **Brand-accurate design** using T3 Solutions' corporate colors (deep navy `#03141b`,
  cyan-blue `#0795cb`, gold `#ffb81c`) and the official logo.
- **Sections:** Hero · About/Stats · Services · IT Manpower Supply · Industries ·
  Portfolio (filterable) · Technology stack · Support model · Contact.
- **Portfolio** built from the company's real project history (HSE platforms,
  AI computer vision, SAP, mobile apps, infrastructure, SOC, and more).
- **IT manpower supply** section covering every specialist type (developers,
  DevOps, AI/ML, SAP, cybersecurity, support, and more) plus engagement models.
- Responsive, accessible, animated on scroll, with a working contact form
  (mailto-based — no backend required).

## Structure

```
t3-website/
├── index.html         # all page markup
├── styles.css         # brand design system + layout
├── script.js          # portfolio data, filtering, animations, nav, form
├── vercel.json        # static hosting config (clean URLs + cache/security headers)
└── assets/
    ├── t3-logo.png         # official logo (transparent)
    ├── favicon.png
    └── apple-touch-icon.png
```

## Run locally

No build step. Just serve the folder:

```bash
cd t3-website
python3 -m http.server 3000
# open http://localhost:3000
```

## Deploy to Vercel

This folder is a standalone static site. In Vercel:

1. Import the Git repository.
2. Set **Root Directory** to `t3-website`.
3. **Framework Preset:** *Other* — leave Build Command empty, **Output Directory** `.`.
4. Deploy, then add the custom domain `t3solutions.kz` in Project → Settings → Domains.

Or with the CLI:

```bash
cd t3-website
vercel --prod
```

## Moving later

Because it's a static bundle with no dependencies, migrating to any other host
(S3 + CloudFront, Netlify, Cloudflare Pages, Nginx, etc.) is a matter of copying
the folder — no runtime, no database, no environment variables.

## Editing content

- **Portfolio projects:** edit the `PROJECTS` array in `script.js`.
- **Copy / sections:** edit `index.html`.
- **Colors / spacing:** edit the CSS variables at the top of `styles.css`.
