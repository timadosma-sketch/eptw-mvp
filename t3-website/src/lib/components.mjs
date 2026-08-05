import { icons } from "./icons.mjs";
import { site, nav, footerCols, legalLinks } from "../data/site.mjs";
import { services } from "../data/services.mjs";
import { industries } from "../data/industries.mjs";

export const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------- Brand logo — "it" wordmark + gradient "X" mark (ITX identity).
   Faithful to the source mark: blue "it", near-square X with thick bars,
   "\" flat blue below, "/" blue→teal→lime gradient on top. ---------- */
export const logo = (id = "lg") => `
<svg viewBox="0 0 118 56" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="itX">
  <defs><linearGradient id="${id}" x1="62" y1="51" x2="110" y2="11" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#1585c8"/><stop offset=".5" stop-color="#2fb3b9"/><stop offset="1" stop-color="#aada4e"/></linearGradient></defs>
  <text x="0" y="43" direction="ltr" font-family="Arial,Helvetica,sans-serif" font-size="47" font-weight="800" fill="#2f9fe0" letter-spacing="-2">it</text>
  <path d="M62 11 L76 11 L110 51 L96 51 Z" fill="#1b7fc4"/>
  <path d="M62 51 L76 51 L110 11 L96 11 Z" fill="url(#${id})"/>
</svg>`;

/* ---------- Header + dropdown navigation ---------- */
function servicesDropdown() {
  const items = services.filter((s) => !s.sub).map((s) =>
    `<a href="/services/${s.slug}/"><b>${esc(s.title)}</b><span>${esc(s.card)}</span></a>`).join("");
  return `<div class="dropdown">${items}<a class="dropdown__all" href="/services/"><b>All capabilities &amp; specialist SAP services</b><span>SAP S/4HANA, Ariba, SuccessFactors, BTP, RPA &amp; more</span></a></div>`;
}
function industriesDropdown() {
  const items = industries.map((i) =>
    `<a href="/industries/${i.slug}/"><b>${esc(i.title)}</b><span>${esc(i.card)}</span></a>`).join("");
  return `<div class="dropdown">${items}</div>`;
}

export function header(current = "") {
  const items = nav.map((n) => {
    const dd = n.dropdown === "services" ? servicesDropdown()
      : n.dropdown === "industries" ? industriesDropdown() : "";
    const caret = dd ? icons.chevron : "";
    const aria = current.startsWith(n.href) && n.href !== "/" ? ' aria-current="page"' : "";
    return `<div class="nav__item"><a class="nav__link" href="${n.href}"${aria}>${esc(n.label)}${caret}</a>${dd}</div>`;
  }).join("");

  const mobItems = nav.map((n) => {
    if (n.dropdown === "services") {
      const sub = services.filter((s) => !s.sub).map((s) => `<a href="/services/${s.slug}/">${esc(s.title)}</a>`).join("");
      return `<details><summary>What We Do ${icons.chevron}</summary>${sub}<a href="/services/">All capabilities &amp; specialist services</a></details>`;
    }
    if (n.dropdown === "industries") {
      const sub = industries.map((i) => `<a href="/industries/${i.slug}/">${esc(i.title)}</a>`).join("");
      return `<details><summary>Industries ${icons.chevron}</summary>${sub}<a href="/industries/">All industries</a></details>`;
    }
    return `<a href="${n.href}">${esc(n.label)}</a>`;
  }).join("");

  return `
<a class="skip" href="#main">Skip to content</a>
<header class="header" id="header">
  <div class="container nav">
    <a class="brand" href="/" aria-label="ITX home">${logo("lg-h")}</a>
    <nav class="nav__menu" aria-label="Primary">${items}</nav>
    <div class="nav__cta">
      <a class="langswitch" href="/ru/" hreflang="ru" lang="ru" aria-label="Русская версия"><span>RU</span></a>
      <a class="langswitch" href="/ar/" hreflang="ar" lang="ar" aria-label="التبديل إلى العربية">${icons.globe}<span>ع</span></a>
      <a class="btn btn--primary" href="/contact/">Discuss Your Transformation</a>
      <button class="nav__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">${icons.menu}</button>
    </div>
  </div>
</header>
<nav class="mobile" id="mobileNav" aria-label="Mobile">
  ${mobItems}
  <a href="/ru/" lang="ru">Русская версия</a>
  <a href="/ar/" lang="ar" dir="rtl">النسخة العربية</a>
  <a class="btn btn--primary btn--block" href="/contact/">Discuss Your Transformation</a>
</nav>`;
}

/* ---------- Footer ---------- */
export function footer() {
  const cols = footerCols.map((c) =>
    `<div><h5>${esc(c.title)}</h5><ul>${c.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("")}</ul></div>`).join("");
  const legal = legalLinks.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join("");
  const socials = site.socials.map((s) => `<a href="${s.href}" aria-label="${esc(s.label)}" rel="noopener">${icons[s.icon] || ""}</a>`).join("");
  const offices = site.offices.filter((o) => o.verified || o.city === "Doha")
    .map((o) => `${esc(o.city)}, ${esc(o.country)}`).join(" · ");
  return `
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        ${logo("lg-f")}
        <p>An enterprise technology and digital transformation partner helping organisations in Qatar and the GCC modernise, integrate, automate and scale.</p>
        <div class="socials" style="margin-top:18px">${socials}</div>
      </div>
      ${cols}
    </div>
    <div class="footer__bottom">
      <p>© <span id="yr">2026</span> ${esc(site.legalName)}. All rights reserved. &nbsp;·&nbsp; ${offices}</p>
      <div class="footer__legal">${legal}</div>
    </div>
  </div>
</footer>`;
}

/* ---------- Small building blocks ---------- */
export const sectionHead = ({ eyebrow, title, text, center } = {}) => `
<div class="section-head${center ? " center" : ""}">
  ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
  <h2>${title}</h2>
  ${text ? `<p>${text}</p>` : ""}
</div>`;

export const capabilityCard = (s) => `
<a class="card linkcard reveal" href="/services/${s.slug}/">
  <div class="card__ic">${icons[s.icon] || icons.layers}</div>
  <h3>${esc(s.title)}</h3>
  <p>${esc(s.card)}</p>
  <span class="card__link">Explore ${esc(s.eyebrow || "capability")} <span class="arrow">${icons.arrow}</span></span>
</a>`;

export const industryCard = (i) => `
<a class="industry linkcard reveal" href="/industries/${i.slug}/">
  <div>
    <div class="industry__ic">${icons[i.icon] || icons.layers}</div>
    <h3>${esc(i.title)}</h3>
    <p>${esc(i.card)}</p>
  </div>
  <span class="card__link">Industry solutions <span class="arrow">${icons.arrow}</span></span>
</a>`;

export const outcomeItem = (o) => `
<div class="outcome reveal">${icons[o.icon] || icons.check}<div><b>${esc(o.title)}</b><span>${esc(o.desc)}</span></div></div>`;

export const solutionCard = (s) => `
<div class="card reveal">
  <div class="card__ic">${icons[s.icon] || icons.layers}</div>
  <h3>${esc(s.title)}</h3>
  <p>${esc(s.desc)}</p>
</div>`;

export const steps = (arr) => `
<div class="steps">${arr.map((s, n) =>
  `<div class="step reveal"><div class="n">0${n + 1}</div><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></div>`).join("")}</div>
<p class="approach-note">Every stage includes governance, risk management, security, quality assurance and stakeholder alignment.</p>`;

export const metricCards = () => site.flags.showMetrics ? `
<div class="metrics">${site.metrics.map((m) =>
  `<div class="metric reveal"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>` : "";

export const cta = ({ title, text, btn = "Schedule a Consultation", href = "/contact/" } = {}) => `
<section class="section"><div class="container">
  <div class="cta reveal"><div class="cta__inner">
    <div><h2>${title}</h2><p>${text}</p></div>
    <a class="btn btn--primary" href="${href}">${esc(btn)} ${icons.arrow}</a>
  </div></div>
</div></section>`;

export const breadcrumbs = (trail) => `
<nav class="crumbs" aria-label="Breadcrumb"><div class="container"><ol>
${trail.map((t, i) => i < trail.length - 1
  ? `<li><a href="${t.href}">${esc(t.label)}</a></li>`
  : `<li aria-current="page">${esc(t.label)}</li>`).join("")}
</ol></div></nav>`;

export const faq = (items) => !items?.length ? "" : `
<div class="faq">${items.map((f) =>
  `<details><summary>${esc(f.q)}<span class="pm">${icons.plus}</span></summary><p>${esc(f.a)}</p></details>`).join("")}</div>`;

/* ---------- Enterprise contact form ---------- */
export const interestOptions = [
  "Digital transformation", "SAP project", "Enterprise integration", "Enterprise AI",
  "Process automation", "Cloud & infrastructure", "Managed services", "Architecture assessment",
  "Partnership", "Careers", "Other",
];

export const contactForm = () => `
<div class="form" id="contactForm">
  <form id="leadForm" novalidate>
    <div class="form-row">
      <div class="field"><label for="f-name">Full name <span class="req">*</span></label><input id="f-name" name="name" type="text" autocomplete="name" required /><span class="err">Please enter your name.</span></div>
      <div class="field"><label for="f-email">Work email <span class="req">*</span></label><input id="f-email" name="email" type="email" autocomplete="email" required /><span class="err">Please enter a valid work email.</span></div>
    </div>
    <div class="form-row">
      <div class="field"><label for="f-company">Company <span class="req">*</span></label><input id="f-company" name="company" type="text" autocomplete="organization" required /><span class="err">Please enter your company.</span></div>
      <div class="field"><label for="f-title">Job title</label><input id="f-title" name="jobtitle" type="text" autocomplete="organization-title" /></div>
    </div>
    <div class="form-row">
      <div class="field"><label for="f-country">Country</label><input id="f-country" name="country" type="text" autocomplete="country-name" value="Qatar" /></div>
      <div class="field"><label for="f-interest">Area of interest</label><select id="f-interest" name="interest">${interestOptions.map((o) => `<option>${esc(o)}</option>`).join("")}</select></div>
    </div>
    <div class="field"><label for="f-msg">Project summary</label><textarea id="f-msg" name="message" placeholder="Tell us about your priorities, systems or timeline."></textarea></div>
    <div class="field">
      <label class="consent"><input type="checkbox" id="f-consent" name="consent" required /><span>I agree to be contacted about my enquiry and have read the <a href="/legal/privacy/" style="color:var(--blue-2)">Privacy Policy</a>. <span class="req">*</span></span></label>
      <span class="err">Please provide consent to continue.</span>
    </div>
    <!-- honeypot (spam protection) -->
    <input type="text" name="company_website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true" />
    <button class="btn btn--primary btn--block" type="submit" data-analytics="contact_submit">Send enquiry ${icons.arrow}</button>
    <p class="note">Your details are handled in line with our Privacy Policy. A specialist will respond within one business day.</p>
  </form>
  <div class="form__ok" role="status">✓ Thank you. Your enquiry is ready to send — your email client will open addressed to our team. We will respond within one business day.</div>
</div>`;

/* ---------- Cookie banner ---------- */
export const cookieBanner = () => `
<div id="cookie" class="hide" role="dialog" aria-label="Cookie notice" style="position:fixed;bottom:16px;left:16px;right:16px;z-index:130;max-width:520px;margin:0 auto;background:rgba(6,26,36,.98);border:1px solid var(--line);border-radius:14px;padding:18px 20px;box-shadow:var(--shadow)">
  <p style="color:var(--muted);font-size:.88rem">We use essential cookies to run this site and optional analytics to improve it. See our <a href="/legal/cookies/" style="color:var(--blue-2)">Cookie Policy</a>.</p>
  <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
    <button class="btn btn--primary" data-cookie="accept" style="padding:9px 18px">Accept</button>
    <button class="btn btn--ghost" data-cookie="essential" style="padding:9px 18px">Essential only</button>
  </div>
</div>`;
