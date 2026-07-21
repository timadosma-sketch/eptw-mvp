# Website Content Approval Checklist

Everything below must be **verified and approved by T3 Solutions management** before the
website is published to a production audience. Nothing in this list has been invented; where
information was unavailable it has been **omitted or gated behind a flag** (see
`src/data/site.mjs → flags`) rather than fabricated.

Legend: ⛔ blocking for launch · ⚠️ recommended before launch · ✅ already handled in code

---

## 1. Company metrics & figures
These figures come from the official company overview deck and are currently displayed
(`flags.showMetrics = true`). Confirm each is accurate and approved for public use.

- [ ] ⛔ "Operating since 2018"
- [ ] ⛔ "30+ specialists & engineers"
- [ ] ⛔ "50+ delivered engagements"
- [ ] ⛔ "100k+ users served"
- [ ] ⚠️ If any figure cannot be substantiated, set `flags.showMetrics = false` — the site
      falls back to the qualitative trust statement automatically.

## 2. Contact information
- [ ] ⛔ Public phone number — currently `+7 701 745 8899` (Kazakhstan). Confirm the number to
      show for a Qatar/GCC audience, or add a Qatar contact number.
- [ ] ⛔ Public email — currently `info@t3solutions.kz`. Confirm, or introduce a `@t3solutions.qa`
      address.
- [ ] ⚠️ Official company LinkedIn URL (placeholder in `site.contact.linkedin`).
- [ ] ⚠️ Primary domain — code is configured for `t3solutions.kz`; update `site.domain` if a
      `.qa` domain will be primary.

## 3. Office locations / regional presence
Only verified locations are shown. Confirm each.
- [ ] ⛔ Doha, Qatar — is there a legal entity / office / active delivery presence? (currently
      shown as "regional engagement"; provide an address only if one genuinely exists)
- [ ] ✅ Almaty, Kazakhstan (Taimanova 230) — from company records
- [ ] ✅ Atyrau, Kazakhstan (Kurmangazy 5) — from company records
- [ ] ⚠️ UAE / wider GCC presence — **not** claimed. Add only if a genuine presence exists.

## 4. Partnership status
No partner is named or logo shown (`flags.showPartnerLogos = false`).
- [ ] ⛔ SAP partnership status and tier — confirm before publishing any SAP partner claim.
- [ ] ⛔ Microsoft / AWS / Google Cloud / Oracle / Cisco / IBM / Dell / Fortinet / VMware /
      Red Hat — do **not** claim partner status unless formally verified. Provide documentation.
- [ ] ⚠️ Any reseller / delivery / technology alliances to be listed on `/partners/`.

## 5. Client names, logos & case studies
None are published (`flags.showClientLogos`, `flags.publishCaseStudies = false`).
- [ ] ⛔ Written approval for each client logo before display.
- [ ] ⛔ Written approval for each named case study, including permitted outcomes/metrics.
- [ ] ⚠️ Approved anonymised case studies (e.g. "Leading Telecommunications Group") — provide
      challenge / scope / solution / outcomes cleared for public use.
- [ ] ⚠️ The "What we build" / Solutions section describes **capabilities**, not delivered client
      projects. Confirm this framing is acceptable.

## 6. Testimonials, awards & recognition
- [ ] ⛔ Any testimonial — with attributed, approved quotes only (`flags.showTestimonials = false`).
- [ ] ⚠️ Awards / analyst recognition — none claimed; add only if verified.

## 7. Certifications & compliance
- [ ] ⛔ ISO or other certifications — **not** claimed anywhere. Provide certificate details to
      display; otherwise leave omitted.
- [ ] ⚠️ Data-protection / security statements on `/about/` — confirm wording is accurate.

## 8. Capabilities to verify
- [ ] ⚠️ **Cybersecurity** — a dedicated service page is **disabled**
      (`flags.enableCybersecurityService = false`). Enable and provide scope only if T3 can
      genuinely deliver security services.
- [ ] ⚠️ **24/7 managed support** — the copy states coverage is agreed per engagement rather than
      claiming a fixed 24/7 SLA. Confirm actual support models offered.
- [ ] ⚠️ SAP product coverage (Ariba, SuccessFactors, BTP, Integration Suite, Joule advisory) —
      confirm which are genuinely offered; remove any that are not.

## 9. Leadership
- [ ] ⛔ Leadership section on `/about/` is intentionally **omitted** until approved. Provide, per
      person: professional photo, name, position, short bio, areas of expertise, LinkedIn URL.

## 10. Insights / articles
- [ ] ⚠️ Pillar articles are **not published** (`flags.publishInsightsArticles = false`). Editorial
      review required before publishing (see `SEO_CONTENT_ROADMAP.md`). No AI filler to be shipped.

## 11. Legal policies
- [ ] ⛔ Privacy Policy, Terms of Use, Cookie Policy are **structural templates** and are
      `noindex`. Must be reviewed/approved by qualified legal counsel and localised for Qatar.
- [ ] ⛔ Confirm data-controller details, retention periods and governing law.

## 12. Arabic translation
- [ ] ⛔ `/ar/` is a professionally-worded "in preparation" placeholder (RTL, hreflang ready). Full
      Arabic content requires **professional human translation** — machine translation must not be
      used as final production copy.

## 13. Analytics & tracking
- [ ] ⚠️ No analytics ID is hardcoded (`flags.analyticsId = ""`). Provide a GA4 / Plausible ID and a
      cookie-consent decision before enabling tracking.

---

### How to flip content on once approved
All gates live in `src/data/site.mjs`. Example:
```js
flags: {
  showMetrics: true,
  publishCaseStudies: true,      // after client approvals
  enableCybersecurityService: true,
  analyticsId: "t3solutions.qa", // enables analytics layer
}
```
Then run `npm run build`.
