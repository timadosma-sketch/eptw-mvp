import { site } from "../data/site.mjs";
import { services, serviceCategories, serviceBySlug, coreServices, childrenOf } from "../data/services.mjs";
import { industries, industryBySlug } from "../data/industries.mjs";
import { businessOutcomes, whyReasons, deliverySteps, solutions, governanceItems, regions } from "../data/content.mjs";
import { insightCategories, insightPillars } from "../data/insights.mjs";
import { icons } from "./icons.mjs";
import {
  esc, sectionHead, capabilityCard, industryCard, outcomeItem, solutionCard,
  steps as stepsC, metricCards, cta, breadcrumbs, faq, contactForm,
} from "./components.mjs";
import { page, breadcrumbLd, faqLd } from "./layout.mjs";

const list = (arr, ic = "check") => `<ul class="split-list" style="display:grid;gap:12px">${arr.map((x) =>
  `<li style="display:flex;gap:12px;align-items:flex-start"><span style="color:var(--blue-2);flex:none;width:22px;height:22px">${icons[ic] || icons.check}</span><span>${esc(x)}</span></li>`).join("")}</ul>`;

const chips = (arr) => `<div class="tags">${arr.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`;

/* ============================ HOME ============================ */
export function home() {
  const capCards = coreServices.map(capabilityCard).join("");
  const indCards = industries.slice(0, 6).map(industryCard).join("");
  const outcomes = businessOutcomes.map(outcomeItem).join("");
  const why = whyReasons.map((r) =>
    `<div class="card reveal"><div class="card__ic">${icons[r.icon] || icons.check}</div><h3>${esc(r.title)}</h3><p>${esc(r.desc)}</p></div>`).join("");
  const solCards = solutions.map(solutionCard).join("");
  const insightCards = insightCategories.slice(0, 4).map((c) =>
    `<a class="card linkcard reveal" href="/insights/#${c.id}"><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p><span class="card__link">Explore ${icons.arrow}</span></a>`).join("");

  const body = `
<section class="hero">
  <div class="hero__bg"><div class="hero__grid"></div></div>
  <div class="container"><div class="hero__inner">
    <div class="reveal in">
      <span class="eyebrow">Enterprise technology & digital transformation</span>
      <h1>Enterprise Technology <span class="grad">Partner for Qatar</span></h1>
      <p class="hero__lead">ITX helps organisations modernise core systems, integrate complex technology landscapes, automate business processes and deliver measurable digital outcomes across Qatar and the GCC.</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="/contact/" data-analytics="cta_discuss">Discuss Your Transformation ${icons.arrow}</a>
        <a class="btn btn--ghost" href="/services/">Explore Our Capabilities</a>
      </div>
      ${site.flags.showMetrics ? `<div class="hero__proof">${site.metrics.map((m) => `<div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>` : ""}
    </div>
    <aside class="hero__panel reveal" aria-label="Core capabilities">
      <h2>What we deliver</h2>
      <ul>
        <li>${icons.sap}<div><b>SAP & enterprise applications</b><span>Modern, upgrade-ready core platforms</span></div></li>
        <li>${icons.integration}<div><b>Integration & architecture</b><span>Connect SAP, non-SAP and legacy systems</span></div></li>
        <li>${icons.ai}<div><b>Enterprise AI</b><span>Assistants, agents and computer vision</span></div></li>
        <li>${icons.automation}<div><b>Process automation</b><span>RPA, workflow and document intelligence</span></div></li>
        <li>${icons.support}<div><b>Managed services</b><span>SLA-based support and continuous improvement</span></div></li>
      </ul>
    </aside>
  </div></div>
</section>

<div class="trust"><div class="container trust__inner">
  <p class="trust__label">Supporting enterprise transformation across Qatar, the GCC and international markets.</p>
  <div class="trust__tags"><span>SAP</span><span>Enterprise AI</span><span>Integration</span><span>Automation</span><span>Cloud</span><span>Managed Services</span></div>
</div></div>

<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Business outcomes", title: "Technology that delivers measurable outcomes", text: "We start from the outcome, not the technology — and align delivery to what the business needs to achieve." })}
  <div class="outcomes">${outcomes}</div>
</div></section>

<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "What we do", title: "Core enterprise capabilities", text: "A full-cycle partner across the enterprise technology landscape — from strategy and architecture to implementation and long-term support." })}
  <div class="grid g-3">${capCards}</div>
</div></section>

<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Industries", title: "Solutions designed around industry priorities", text: "We combine technical depth with an understanding of the operational realities of the sectors we serve." })}
  <div class="grid g-3">${indCards}</div>
  <div class="mt-m"><a class="btn btn--ghost" href="/industries/">View all industries ${icons.arrow}</a></div>
</div></section>

<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "Why ITX", title: "A partner built for enterprise delivery" })}
  <div class="grid g-3">${why}</div>
</div></section>

<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Delivery approach", title: "A structured model from strategy to continuous improvement" })}
  ${stepsC(deliverySteps)}
</div></section>

<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "Solutions", title: "What we build" })}
  <div class="grid g-3">${solCards}</div>
</div></section>

<section class="section"><div class="container">
  <div class="split">
    <div class="reveal">
      <span class="eyebrow">Regional presence</span>
      <h2 class="mt-s">Local engagement, regional delivery, international expertise</h2>
      <p class="lead mt-s">We combine on-the-ground engagement in Qatar and the GCC with regional delivery strength and access to international specialists — through flexible onsite, nearshore and remote models.</p>
      ${site.flags.showMetrics ? metricCards() : ""}
    </div>
    <div class="panel reveal">
      <ul style="display:grid;gap:14px">
        ${regions.map((r) => `<li style="display:flex;gap:12px;align-items:flex-start"><span style="color:var(--gold);flex:none;width:22px;height:22px">${icons.pin}</span><div><b style="color:var(--white)">${esc(r.city)}</b><span style="display:block;color:var(--muted);font-size:.9rem">${esc(r.note)}</span></div></li>`).join("")}
      </ul>
    </div>
  </div>
</div></section>

<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "Insights", title: "Enterprise technology, explained" })}
  <div class="grid g-4">${insightCards}</div>
</div></section>

${cta({ title: "Ready to modernise your enterprise technology landscape?", text: "Speak with our team about your transformation priorities, integration challenges, SAP roadmap, automation opportunities or managed-services requirements." })}
`;
  return page({
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    path: "/",
  }, body);
}

/* ====================== SERVICES INDEX ====================== */
export function servicesIndex() {
  const groups = serviceCategories.map((c) => {
    const items = services.filter((s) => s.category === c.id && !s.sub);
    if (!items.length) return "";
    return `<div style="margin-bottom:8px"><h3 style="color:var(--gold);font-size:1rem;letter-spacing:.04em;text-transform:uppercase;margin:26px 0 4px">${esc(c.title)}</h3></div><div class="grid g-3">${items.map(capabilityCard).join("")}</div>`;
  }).join("");

  const subs = services.filter((s) => s.sub);
  const specialist = subs.length ? `
<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "Specialist services", title: "Specialist SAP &amp; platform services", text: "Focused delivery capabilities within our core practices — for organisations with a specific SAP product, platform or transformation need." })}
  <div class="grid g-3">${subs.map((s) => `<a class="card linkcard reveal" href="/services/${s.slug}/"><div class="card__ic">${icons[s.icon] || icons.layers}</div><h3>${esc(s.title)}</h3><p>${esc(s.card)}</p><span class="card__link">Explore ${icons.arrow}</span></a>`).join("")}</div>
</div></section>` : "";

  const trail = [{ label: "Home", href: "/" }, { label: "What We Do", href: "/services/" }];
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container">
  <div class="phero">
    <span class="eyebrow">What we do</span>
    <h1>Enterprise capabilities across the technology landscape</h1>
    <p>From SAP and enterprise integration to AI, automation, cloud and managed services — delivered with architecture-led rigour and long-term accountability.</p>
    <div class="hero__actions"><a class="btn btn--primary" href="/contact/">Discuss Your Transformation ${icons.arrow}</a><a class="btn btn--ghost" href="/industries/">View Industry Solutions</a></div>
  </div>
  <div style="margin-top:40px">${groups}</div>
</div></section>
${specialist}
${cta({ title: "Not sure where to start?", text: "Speak with our team about your priorities and we will help shape a pragmatic, outcome-focused path.", btn: "Discuss Your Transformation" })}`;
  return page({
    title: "Enterprise Technology Services in Qatar | ITX",
    description: "ITX' enterprise capabilities in Qatar — SAP, enterprise integration, AI, process automation, cloud, data, IoT, managed services and technology advisory.",
    path: "/services/",
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== SERVICE PAGE ====================== */
export function servicePage(s) {
  const trail = [{ label: "Home", href: "/" }, { label: "What We Do", href: "/services/" }, { label: s.title, href: `/services/${s.slug}/` }];
  const relatedInd = (s.industries || []).map((slug) => industryBySlug[slug]).filter(Boolean).slice(0, 5);
  const relatedSvc = (s.related || []).map((slug) => serviceBySlug[slug]).filter(Boolean);
  const children = childrenOf(s.slug);
  const parent = s.sub ? serviceBySlug[s.parentSlug] : null;
  const serviceLd = {
    "@context": "https://schema.org", "@type": "Service",
    serviceType: s.title, name: s.h1, description: s.valueProp,
    provider: { "@type": "ProfessionalService", name: site.name, url: site.domain + "/" },
    areaServed: ["Qatar", "GCC"], url: site.domain + `/services/${s.slug}/`,
  };
  const body = `
${breadcrumbs(trail)}
<section class="section section--tight"><div class="container">
  <div class="phero">
    <span class="eyebrow">${esc(s.eyebrow)}</span>
    <h1>${esc(s.h1)}</h1>
    <p>${esc(s.valueProp)}</p>
    ${parent ? `<p class="muted" style="margin-top:6px">Part of our <a href="/services/${parent.slug}/" style="color:var(--blue-2)">${esc(parent.title)}</a> practice.</p>` : ""}
    <div class="hero__actions"><a class="btn btn--primary" href="/contact/?interest=${encodeURIComponent(s.title)}">Discuss this capability ${icons.arrow}</a><a class="btn btn--ghost" href="/services/">All capabilities</a></div>
  </div>
</div></section>

<section class="section section--alt"><div class="container">
  <div class="split">
    <div class="reveal"><span class="eyebrow">Challenges we address</span><h2 class="mt-s">Common challenges</h2>${list(s.challenges, "check")}</div>
    <div class="reveal"><span class="eyebrow">Outcomes</span><h2 class="mt-s">Business outcomes</h2>${list(s.outcomes, "target")}</div>
  </div>
</div></section>

<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Capabilities", title: "What we deliver" })}
  <div class="grid g-3">${s.capabilities.map((c) => `<div class="card reveal"><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p></div>`).join("")}</div>
  <div style="margin-top:30px"><span class="eyebrow">Relevant technologies</span><div class="mt-s">${chips(s.technologies)}</div></div>
</div></section>

${children.length ? `<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "Specialist services", title: "Specialist services in this practice" })}
  <div class="grid g-3">${children.map((c) => `<a class="card linkcard reveal" href="/services/${c.slug}/"><div class="card__ic">${icons[c.icon] || icons.layers}</div><h3>${esc(c.title)}</h3><p>${esc(c.card)}</p><span class="card__link">Explore ${icons.arrow}</span></a>`).join("")}</div>
</div></section>` : ""}

<section class="section${children.length ? "" : " section--alt"}"><div class="container">
  ${sectionHead({ eyebrow: "Delivery approach", title: "How we deliver" })}
  ${stepsC(deliverySteps)}
</div></section>

${relatedInd.length ? `<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Industries", title: "Relevant industries" })}
  <div class="grid g-3">${relatedInd.map(industryCard).join("")}</div>
</div></section>` : ""}

${s.faqs?.length ? `<section class="section section--alt"><div class="container container--narrow">
  ${sectionHead({ eyebrow: "FAQ", title: "Frequently asked questions" })}
  ${faq(s.faqs)}
</div></section>` : ""}

${relatedSvc.length ? `<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Related capabilities", title: "Explore related services" })}
  <div class="grid g-3">${relatedSvc.map(capabilityCard).join("")}</div>
</div></section>` : ""}

${cta({ title: "Discuss your " + s.title.toLowerCase() + " priorities", text: "Speak with a specialist about your landscape, objectives and timeline.", btn: "Schedule a Consultation" })}`;
  return page({
    title: s.seoTitle + " | ITX",
    description: s.seoDescription,
    path: `/services/${s.slug}/`,
    jsonld: [breadcrumbLd(trail), serviceLd, faqLd(s.faqs)],
  }, body);
}

/* ====================== INDUSTRIES INDEX ====================== */
export function industriesIndex() {
  const trail = [{ label: "Home", href: "/" }, { label: "Industries", href: "/industries/" }];
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container">
  <div class="phero">
    <span class="eyebrow">Industries</span>
    <h1>Technology solutions designed around industry priorities</h1>
    <p>We combine technical depth with an understanding of the operational realities, compliance demands and transformation opportunities of the sectors we serve.</p>
  </div>
  <div class="grid g-3" style="margin-top:36px">${industries.map(industryCard).join("")}</div>
</div></section>
${cta({ title: "Let's discuss your sector", text: "Speak with our team about the challenges and opportunities specific to your industry." })}`;
  return page({
    title: "Industry Technology Solutions in Qatar | ITX",
    description: "Industry-focused technology solutions in Qatar — government, energy, oil & gas, telecom, banking, healthcare, manufacturing, mining and logistics.",
    path: "/industries/",
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== INDUSTRY PAGE ====================== */
export function industryPage(i) {
  const trail = [{ label: "Home", href: "/" }, { label: "Industries", href: "/industries/" }, { label: i.title, href: `/industries/${i.slug}/` }];
  const relatedSvc = (i.services || []).map((slug) => serviceBySlug[slug]).filter(Boolean);
  const body = `
${breadcrumbs(trail)}
<section class="section section--tight"><div class="container">
  <div class="phero">
    <span class="eyebrow">Industries</span>
    <h1>${esc(i.h1)}</h1>
    <p>${esc(i.intro)}</p>
    <div class="hero__actions"><a class="btn btn--primary" href="/contact/">Discuss your priorities ${icons.arrow}</a></div>
  </div>
</div></section>

<section class="section section--alt"><div class="container">
  <div class="split">
    <div class="reveal"><span class="eyebrow">Industry challenges</span><h2 class="mt-s">Challenges we address</h2>${list(i.challenges, "check")}</div>
    <div class="reveal"><span class="eyebrow">Outcomes</span><h2 class="mt-s">Business outcomes</h2>${list(i.outcomes, "target")}</div>
  </div>
</div></section>

<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Capabilities", title: "How we help" })}
  <div class="grid g-2">${i.capabilities.map((c) => `<div class="outcome" style="border:1px solid var(--line);border-radius:12px;padding:18px 20px">${icons.check}<span>${esc(c)}</span></div>`).join("")}</div>
  <div style="margin-top:26px"><span class="eyebrow">Relevant technologies</span><div class="mt-s">${chips(i.technologies)}</div></div>
</div></section>

${relatedSvc.length ? `<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "Related capabilities", title: "Relevant services" })}
  <div class="grid g-3">${relatedSvc.map(capabilityCard).join("")}</div>
</div></section>` : ""}

${cta({ title: `Technology solutions for ${i.title.toLowerCase()}`, text: "Speak with our team about the transformation opportunities specific to your organisation." })}`;
  return page({
    title: i.seoTitle + " | ITX",
    description: i.seoDescription,
    path: `/industries/${i.slug}/`,
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== SOLUTIONS ====================== */
export function solutionsPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Solutions", href: "/solutions/" }];
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container">
  <div class="phero"><span class="eyebrow">Solutions</span><h1>Enterprise solutions we build</h1>
  <p>Repeatable solution areas that combine our capabilities to address recurring enterprise and industrial needs.</p></div>
  <div class="grid g-3" style="margin-top:36px">${solutions.map(solutionCard).join("")}</div>
  ${!site.flags.publishCaseStudies ? `<div class="notice" style="margin-top:36px">Detailed, named success stories are published only once client approval is confirmed. Anonymised references are available on request during commercial discussions.</div>` : ""}
</div></section>
${cta({ title: "Have a specific challenge in mind?", text: "Tell us what you are trying to achieve and we will shape a solution around it." })}`;
  return page({
    title: "Enterprise Solutions | ITX Qatar",
    description: "Enterprise solution areas from ITX — HSE and safety intelligence, asset performance and digital twins, SAP, integration, automation and enterprise AI.",
    path: "/solutions/",
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== ABOUT ====================== */
export function aboutPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "About", href: "/about/" }];
  const gov = governanceItems.map((g) =>
    `<div class="card reveal"><div class="card__ic">${icons[g.icon] || icons.shield}</div><h3>${esc(g.title)}</h3><p>${esc(g.desc)}</p></div>`).join("");
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container container--narrow">
  <div class="phero"><span class="eyebrow">About us</span><h1>An enterprise technology partner for Qatar and the GCC</h1>
  <p>We help organisations solve complex technology challenges by combining enterprise architecture, systems integration, digital platforms, automation and specialist delivery expertise.</p></div>
</div></section>

<section class="section section--alt"><div class="container">
  <div class="split">
    <div class="reveal">
      <span class="eyebrow">Our positioning</span>
      <h2 class="mt-s">Business understanding meets technical depth</h2>
      <p class="lead mt-s">ITX is a full-cycle system integrator and digital transformation partner. We modernise core systems, integrate complex landscapes, automate processes and apply data and AI — with the governance and accountability enterprise programmes require.</p>
      <p class="muted mt-s">Our approach is architecture-led and vendor-neutral: we recommend what serves your outcomes, and we stay to support what we deliver.</p>
    </div>
    <div class="panel reveal">
      <h3 style="color:var(--gold);margin-bottom:14px">How we work</h3>
      <ul style="display:grid;gap:12px">
        ${["Architecture-led, not one-off builds", "End-to-end from strategy to support", "Flexible onsite, nearshore and remote delivery", "Senior specialists across SAP, AI, data and integration", "Strong governance, quality assurance and risk management"].map((x) => `<li style="display:flex;gap:12px"><span style="color:var(--blue-2);width:22px;height:22px;flex:none">${icons.check}</span><span>${esc(x)}</span></li>`).join("")}
      </ul>
    </div>
  </div>
</div></section>

<section class="section"><div class="container">
  ${sectionHead({ eyebrow: "Governance & trust", title: "Delivery you can rely on", text: "We build trust through transparency, security awareness and disciplined delivery governance." })}
  <div class="grid g-3">${gov}</div>
</div></section>

<section class="section section--alt"><div class="container">
  ${sectionHead({ eyebrow: "Leadership", title: "Our leadership" })}
  <div class="notice">Verified leadership profiles — including names, roles, biographies and LinkedIn links — will be published here once approved by management. This section is intentionally omitted until confirmed content is available.</div>
</div></section>

${cta({ title: "Work with a partner built for enterprise delivery", text: "Talk to our team about your transformation priorities — or explore opportunities to join us.", btn: "Contact Us" })}`;
  return page({
    title: "About ITX | Enterprise Technology Partner in Qatar",
    description: "ITX is an enterprise technology and digital transformation partner in Qatar and the GCC — architecture-led, vendor-neutral, and focused on measurable outcomes.",
    path: "/about/",
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== CONTACT ====================== */
export function contactPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Contact", href: "/contact/" }];
  const offices = site.offices.filter((o) => o.verified || o.city === "Doha").map((o) =>
    `<div>${esc(o.city)}, ${esc(o.country)}${o.address ? ` — ${esc(o.address)}` : ""}</div>`).join("");
  const contactLd = {
    "@context": "https://schema.org", "@type": "ContactPage",
    name: "Contact ITX", url: site.domain + "/contact/",
  };
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container">
  <div class="phero"><span class="eyebrow">Contact us</span><h1>Discuss your transformation priorities</h1>
  <p>Speak with our team about your SAP roadmap, integration challenges, automation opportunities, AI ambitions or managed-services requirements.</p></div>
  <div class="contact-grid" style="margin-top:40px">
    <div>
      <a class="info" href="${site.contact.phoneHref}"><span class="info__ic">${icons.phone}</span><span><small>Phone</small><b>${esc(site.contact.phone)}</b></span></a>
      <a class="info" href="mailto:${site.contact.email}"><span class="info__ic">${icons.mail}</span><span><small>Email</small><b>${esc(site.contact.email)}</b></span></a>
      <div class="info"><span class="info__ic">${icons.pin}</span><span><small>Offices</small><b style="font-weight:500;color:var(--muted)">${offices}</b></span></div>
      <div class="info"><span class="info__ic">${icons.globe}</span><span><small>Languages</small><b style="font-weight:500;color:var(--muted)">English · Arabic (in preparation)</b></span></div>
    </div>
    ${contactForm()}
  </div>
</div></section>`;
  return page({
    title: "Contact ITX | Enterprise Technology in Qatar",
    description: "Contact ITX to discuss enterprise transformation, SAP, integration, AI, automation or managed services in Qatar and the GCC.",
    path: "/contact/",
    jsonld: [breadcrumbLd(trail), contactLd],
  }, body);
}

/* ====================== PARTNERS ====================== */
export function partnersPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Partners", href: "/partners/" }];
  const reasons = [
    ["Local market support", "On-the-ground engagement and market understanding in Qatar and the GCC."],
    ["Regional delivery", "Delivery capacity that scales across the region."],
    ["Joint go-to-market", "Collaboration on opportunities, bids and proposals."],
    ["Specialist resource access", "Access to specialist skills across SAP, AI, data and integration."],
    ["Implementation support", "Hands-on delivery and integration support."],
    ["Managed-service collaboration", "Long-term support and service collaboration."],
  ];
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container">
  <div class="phero"><span class="eyebrow">Partners</span><h1>Partner with ITX</h1>
  <p>We work with technology, delivery and market partners to bring the right capabilities to enterprise programmes across Qatar and the GCC.</p></div>
  <div class="grid g-3" style="margin-top:36px">${reasons.map(([t, d]) => `<div class="card reveal"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}</div>
  ${!site.flags.showPartnerLogos ? `<div class="notice" style="margin-top:32px">Technology and delivery partnerships are listed publicly only once formally verified. Please contact us to discuss collaboration.</div>` : ""}
</div></section>
<section class="section section--alt" id="enquire"><div class="container">
  ${sectionHead({ eyebrow: "Partner enquiry", title: "Explore a partnership", text: "Tell us about your organisation and how you would like to collaborate." })}
  <div style="max-width:760px">${contactForm()}</div>
</div></section>`;
  return page({
    title: "Partners | ITX Qatar",
    description: "Partner with ITX — technology, delivery and market collaboration for enterprise transformation programmes across Qatar and the GCC.",
    path: "/partners/",
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== CAREERS ====================== */
export function careersPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Careers", href: "/careers/" }];
  const roles = [
    ["Consulting & advisory", "Enterprise architects, transformation and functional consultants."],
    ["SAP practice", "S/4HANA, Ariba, SuccessFactors and BTP specialists."],
    ["Engineering & data", "Integration, application, data and platform engineers."],
    ["AI & automation", "AI, data-science, computer-vision and automation specialists."],
    ["Managed services", "Application support, service management and operations."],
    ["Project delivery", "Project and programme managers, delivery leads."],
  ];
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container">
  <div class="phero"><span class="eyebrow">Careers</span><h1>Build enterprise technology that matters</h1>
  <p>We bring together skilled professionals across consulting, engineering and delivery to help organisations in Qatar and the region transform with confidence.</p></div>
  <div class="grid g-3" style="margin-top:36px">${roles.map(([t, d]) => `<div class="card reveal"><div class="card__ic">${icons.briefcase}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}</div>
  <div class="notice" style="margin-top:32px">Current vacancies will be published here as they open. In the meantime, we welcome general applications from experienced enterprise technology professionals — please contact us with your CV and areas of expertise.</div>
  <div class="mt-m"><a class="btn btn--primary" href="/contact/?interest=Careers">Submit a general application ${icons.arrow}</a></div>
</div></section>`;
  return page({
    title: "Careers | ITX Qatar",
    description: "Careers at ITX — consulting, SAP, engineering, AI, automation, managed services and delivery roles across Qatar and the region.",
    path: "/careers/",
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== INSIGHTS ====================== */
export function insightsPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Insights", href: "/insights/" }];
  const cats = insightCategories.map((c) =>
    `<div class="card reveal" id="${c.id}"><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p></div>`).join("");
  const pillars = site.flags.publishInsightsArticles
    ? `<div class="grid g-3">${insightPillars.map((p) => `<a class="card linkcard reveal" href="/insights/${p.slug}/"><span class="chip">${esc(p.category.toUpperCase())}</span><h3 style="margin-top:12px">${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="card__link">Read ${icons.arrow}</span></a>`).join("")}</div>`
    : `<div class="notice">Our Knowledge Centre is being built. Pillar guides and articles across SAP, enterprise AI, integration, automation and managed services are in editorial review and will be published progressively. See the topics we cover below.</div>`;
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container">
  <div class="phero"><span class="eyebrow">Insights & knowledge centre</span><h1>Enterprise technology, explained</h1>
  <p>Practical perspectives on SAP transformation, enterprise AI, integration, automation, cloud and managed services — written for enterprise decision-makers in Qatar and the GCC.</p></div>
  <div style="margin-top:36px">${pillars}</div>
  <div style="margin-top:40px">${sectionHead({ eyebrow: "Topics", title: "What we write about" })}<div class="grid g-4">${cats}</div></div>
</div></section>
${cta({ title: "Have a question our team can help with?", text: "Speak with a specialist about your transformation priorities.", btn: "Contact Us" })}`;
  return page({
    title: "Insights & Knowledge Centre | ITX Qatar",
    description: "Enterprise technology insights from ITX — SAP transformation, enterprise AI, integration, automation, cloud and managed services for Qatar and the GCC.",
    path: "/insights/",
    jsonld: [breadcrumbLd(trail)],
  }, body);
}

/* ====================== LEGAL ====================== */
function legal(slug, title, intro, sections) {
  const trail = [{ label: "Home", href: "/" }, { label: title, href: `/legal/${slug}/` }];
  const body = `
${breadcrumbs(trail)}
<section class="section"><div class="container container--narrow">
  <div class="phero"><span class="eyebrow">Legal</span><h1>${esc(title)}</h1></div>
  <div class="prose" style="margin-top:24px">
    <div class="notice">This is a structural template. Final ${esc(title.toLowerCase())} wording must be reviewed and approved by qualified legal counsel and localised for Qatar before publication.</div>
    <p style="margin-top:20px">${esc(intro)}</p>
    ${sections.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join("")}
    <p class="muted">This policy will be dated on publication. Contact: <a href="mailto:${site.contact.email}">${esc(site.contact.email)}</a>.</p>
  </div>
</div></section>`;
  return {
    path: `/legal/${slug}/`,
    html: page({
      title: `${title} | ITX`,
      description: `${title} for the ITX website.`,
      path: `/legal/${slug}/`, robots: "noindex,follow",
      jsonld: [breadcrumbLd(trail)],
    }, body),
  };
}

export function legalPages() {
  return [
    legal("privacy", "Privacy Policy",
      "This policy explains how ITX collects, uses and protects personal information submitted through this website.",
      [
        { h: "Information we collect", p: "We collect the information you provide through enquiry forms, such as name, work email, company, job title, country and message details." },
        { h: "How we use information", p: "We use your information to respond to enquiries, provide requested information and manage our business relationship with you." },
        { h: "Legal basis and consent", p: "We process enquiry information on the basis of your consent and our legitimate interest in responding to business enquiries." },
        { h: "Data sharing", p: "We do not sell personal information. Information may be shared with service providers strictly to operate our business, under appropriate safeguards." },
        { h: "Data retention", p: "We retain enquiry information only for as long as necessary to fulfil the purposes described in this policy." },
        { h: "Your rights", p: "Subject to applicable law, you may request access to, correction of, or deletion of your personal information by contacting us." },
        { h: "Contact", p: "For any privacy request, contact us using the details below." },
      ]),
    legal("terms", "Terms of Use",
      "These terms govern your use of the ITX website.",
      [
        { h: "Use of this website", p: "This website is provided for general information about ITX and its services. Content may change without notice." },
        { h: "Intellectual property", p: "All content on this website is owned by or licensed to ITX and may not be reproduced without permission." },
        { h: "No warranty", p: "Information is provided in good faith but without warranty of completeness or fitness for a particular purpose." },
        { h: "Limitation of liability", p: "To the extent permitted by law, ITX is not liable for any loss arising from use of this website." },
        { h: "Governing law", p: "These terms are governed by the applicable laws of the relevant jurisdiction, to be confirmed on publication." },
      ]),
    legal("cookies", "Cookie Policy",
      "This policy explains how cookies are used on the ITX website.",
      [
        { h: "What are cookies", p: "Cookies are small files stored on your device that help websites function and understand how they are used." },
        { h: "Cookies we use", p: "We use essential cookies required for the site to function, and optional analytics cookies only where you have provided consent." },
        { h: "Managing cookies", p: "You can accept or limit optional cookies using the cookie notice, and manage cookies through your browser settings." },
      ]),
  ];
}

/* ====================== 404 ====================== */
export function notFound() {
  const body = `
<section class="section" style="padding-top:160px"><div class="container container--narrow center">
  <span class="eyebrow" style="justify-content:center">Error 404</span>
  <h1 style="margin:16px 0">This page could not be found</h1>
  <p class="lead" style="margin-inline:auto">The page you are looking for may have moved. Explore our capabilities or return to the homepage.</p>
  <div class="hero__actions" style="justify-content:center;margin-top:28px"><a class="btn btn--primary" href="/">Return home ${icons.arrow}</a><a class="btn btn--ghost" href="/services/">Explore capabilities</a></div>
</div></section>`;
  return page({
    title: "Page not found | ITX",
    description: "The page you are looking for could not be found.",
    path: "/404.html", robots: "noindex,follow",
  }, body);
}

/* ====================== ARABIC PLACEHOLDER ====================== */
export function arabicHome() {
  const body = `
<section class="section" style="padding-top:160px"><div class="container container--narrow center">
  <span class="eyebrow" style="justify-content:center">قريبًا</span>
  <h1 style="margin:16px 0">النسخة العربية قيد الإعداد</h1>
  <p class="lead" style="margin-inline:auto">نعمل على إطلاق النسخة العربية الكاملة لموقع ITX بترجمة احترافية. في الوقت الحالي، تتوفر النسخة الإنجليزية.</p>
  <div class="hero__actions" style="justify-content:center;margin-top:28px"><a class="btn btn--primary" href="/">English site ${icons.arrow}</a><a class="btn btn--ghost" href="/contact/">تواصل معنا</a></div>
</div></section>`;
  return page({
    title: "ITX — النسخة العربية قيد الإعداد",
    description: "النسخة العربية لموقع ITX قيد الإعداد بترجمة احترافية. النسخة الإنجليزية متاحة الآن.",
    path: "/ar/", lang: "ar", dir: "rtl", robots: "noindex,follow",
  }, body);
}
