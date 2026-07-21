# SEO & Content Roadmap — T3 Solutions

Target market: **Qatar and the GCC**. Audience: enterprise technology decision-makers (CIO/CTO/CDO,
IT directors, procurement, government/telecom/energy leaders, SAP programme owners).

## Priority landing pages (built)
Each is a unique, indexable page with one H1, structured headings, FAQ where useful, JSON-LD and
internal links.

| Priority | Page | URL |
|---|---|---|
| 1 | SAP Consulting | `/services/sap-consulting-qatar/` |
| 1 | Enterprise Integration | `/services/enterprise-integration-qatar/` |
| 1 | Managed Services / SAP AMS | `/services/managed-services-qatar/` |
| 2 | Enterprise AI | `/services/enterprise-ai-qatar/` |
| 2 | Process Automation & RPA | `/services/business-process-automation-qatar/` |
| 2 | Technology Advisory | `/services/technology-advisory-qatar/` |
| 3 | Cloud & Infrastructure | `/services/it-infrastructure-cloud-qatar/` |
| 3 | Business Intelligence & Data | `/services/business-intelligence-data-qatar/` |
| 3 | Custom Application Development | `/services/custom-application-development-qatar/` |
| 3 | IoT & Industrial Systems | `/services/iot-industrial-systems-qatar/` |
| — | Industry pages | `/industries/<sector>/` (9 built) |

### Additional service URLs to split out (Phase 2, from data)
The following brief-requested URLs can be created as focused pages by adding entries to
`src/data/services.mjs` (they are currently covered within parent pages):
`/services/sap-s4hana-qatar/`, `/services/sap-ariba-qatar/`, `/services/sap-successfactors-qatar/`,
`/services/sap-btp-qatar/`, `/services/sap-integration-suite-qatar/`, `/services/rpa-qatar/`,
`/services/enterprise-architecture-qatar/`, `/services/sap-ams-qatar/`.

## Target keyword themes (map, do not stuff)
- SAP consulting Qatar · SAP S/4HANA consulting Qatar · SAP implementation partner Qatar
- SAP Ariba / SuccessFactors / BTP / Integration Suite Qatar
- enterprise integration Qatar · systems integrator Qatar · API strategy Qatar
- AI consulting Qatar · enterprise AI solutions Qatar
- business process automation Qatar · RPA services Qatar
- cloud consulting Qatar · managed IT services Qatar · SAP AMS Qatar
- enterprise architecture Qatar · technology consulting Doha · digital transformation Qatar
- government / telecom / energy technology consulting Qatar

Map one primary theme per page; use natural language around user intent.

## Content clusters (pillar → supporting)
Pillars are stubbed in `src/data/insights.mjs`; publishing is gated until editorial review.

1. **SAP transformation** → `/insights/sap-transformation-qatar/`
   S/4HANA migration · Ariba roadmap · BTP use cases · Integration Suite architecture · AMS models ·
   SuccessFactors integration · clean-core strategy · SAP security & identity
2. **Enterprise AI** → `/insights/enterprise-ai-qatar/`
   AI readiness · AI agents for operations · RAG architecture · AI governance · knowledge assistants ·
   AI for telecom/government/energy · SAP Joule readiness · responsible adoption
3. **Enterprise integration** → `/insights/enterprise-integration-qatar/`
   API strategy · integration governance · hybrid integration · SAP + non-SAP · middleware
   modernisation · event-driven architecture · integration monitoring · master data
4. **Automation** → `/insights/business-process-automation-qatar/`
   RPA use cases · IDP · workflow automation · automation governance · process mining · finance /
   procurement / HR automation
5. **Managed services** → `/insights/managed-services-qatar/`
   AMS models · SLA design · ITSM governance · hypercare transition · monitoring · continuous
   improvement · support operating models

## Internal linking plan
- Industry pages → related service pages (implemented via `industries[].services`)
- Service pages → related industries and related services (implemented)
- Homepage → capabilities, industries, insights (implemented)
- Insights articles → relevant service pages + CTA (implement per article)
- Contact CTA present on every commercial page (implemented)

## Technical SEO (implemented)
Unique titles/descriptions · canonical · OG/Twitter · hreflang (en/ar/x-default) · JSON-LD
(Organization, WebSite, ProfessionalService, Service, BreadcrumbList, FAQPage, ContactPage) ·
XML sitemap · robots.txt · semantic HTML + single H1 · breadcrumbs · clean trailing-slash URLs ·
custom 404 (noindex) · `noindex` on legal/utility pages · web manifest.

### Technical SEO — remaining tasks
- [ ] Add an OG image (`/assets/og-cover.png`, 1200×630) and reference in `<meta og:image>`.
- [ ] Configure 301 redirects from the previous single-page URLs if any were indexed.
- [ ] Submit sitemap in Google Search Console + Bing Webmaster once live on the production domain.
- [ ] Confirm production domain (`t3solutions.kz` vs `.qa`) and update `site.domain`.
- [ ] Add `Article`/`BlogPosting` + `Person` JSON-LD when insights/leadership go live.
- [ ] Add `JobPosting` JSON-LD when real vacancies are published.

## Local SEO (Qatar)
- [ ] Create/verify Google Business Profile once a confirmed Qatar address exists.
- [ ] Consistent NAP (name, address, phone) across site and directories.
- [ ] Qatar-relevant content and internal links to `-qatar` pages.

## 3-month roadmap
- Month 1: confirm content approvals; publish 3 SAP pillar-cluster articles; launch analytics; GBP.
- Month 2: enterprise AI + integration clusters (4–6 articles); split priority SAP sub-pages.
- Month 3: automation + managed-services clusters; first approved anonymised case studies.

## 6-month roadmap
- Complete all five clusters (25–30 quality articles).
- Publish approved case studies and client logos.
- Ship full Arabic site (professional translation) with `/ar/` hreflang.
- Enterprise-architecture and SAP sub-service landing pages.
- Begin link-earning: regional publications, partner co-marketing.

## Measurement KPIs
Organic sessions to `-qatar` pages · keyword rankings (SAP/AI/integration Qatar) · qualified
enquiries (contact submissions by area of interest) · CTA click-through · case-study engagement ·
Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1) · indexed page count · assisted conversions.
