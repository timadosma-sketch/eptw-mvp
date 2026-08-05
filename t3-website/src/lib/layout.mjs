import { site } from "../data/site.mjs";
import { header, footer, cookieBanner } from "./components.mjs";

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3ClinearGradient id='fx' x1='12' y1='36' x2='38' y2='10' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%230e78c0'/%3E%3Cstop offset='1' stop-color='%238fc73e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='48' height='48' rx='10' fill='%2303141b'/%3E%3Cpath d='M13 12 19 12 39 36 33 36Z' fill='%232a9fd0'/%3E%3Cpath d='M13 36 19 36 39 12 33 12Z' fill='url(%23fx)'/%3E%3C/svg%3E";

/* Organisation + WebSite base JSON-LD — no fabricated ratings, employee
   counts, or social profiles. LinkedIn added only when verified in site data. */
export function baseJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.domain + "/",
    description: site.description,
    areaServed: ["Qatar", "GCC"],
    knowsAbout: ["SAP", "Enterprise Integration", "Enterprise AI", "Process Automation", "Cloud", "Managed Services"],
    email: site.contact.email,
    telephone: site.contact.phone,
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.domain + "/",
    inLanguage: "en",
  };
  return [org, website];
}

export function breadcrumbLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem", position: i + 1, name: t.label,
      item: site.domain + t.href,
    })),
  };
}

export function faqLd(items) {
  if (!items?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function page({ title, description, path = "/", jsonld = [], lang = "en", dir = "ltr", robots } = {}, body = "") {
  const canonical = site.domain + path;
  const ld = [...baseJsonLd(), ...jsonld].filter(Boolean)
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
  const analytics = site.flags.analyticsId
    ? `<script defer data-domain="${site.contact.website}" src="https://plausible.io/js/script.tagged-events.js"></script>`
    : `<!-- analytics: set site.flags.analyticsId to enable a privacy-conscious analytics layer -->`;
  const robotsTag = robots ? `<meta name="robots" content="${robots}" />` : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
${robotsTag}
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="en" href="${site.domain}${path}" />
<link rel="alternate" hreflang="ar" href="${site.domain}/ar${path === "/" ? "/" : path}" />
<link rel="alternate" hreflang="x-default" href="${site.domain}${path}" />
<meta name="theme-color" content="#03141b" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${site.name}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:locale" content="en_QA" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<link rel="icon" href="${FAVICON}" />
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" />
<link rel="stylesheet" href="/styles.css" />
${ld}
${analytics}
</head>
<body>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
${cookieBanner()}
<script src="/app.js" defer></script>
</body>
</html>`;
}

/* Client-side behaviour (written to /app.js) */
export const APP_JS = `(function(){
"use strict";
var h=document.getElementById('header');
function onScroll(){ if(h) h.classList.toggle('scrolled', window.scrollY>20); }
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

var tg=document.getElementById('navToggle'), mm=document.getElementById('mobileNav');
if(tg&&mm){ tg.addEventListener('click',function(){ var o=mm.classList.toggle('open'); tg.setAttribute('aria-expanded',o?'true':'false'); });
  mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ mm.classList.remove('open'); tg.setAttribute('aria-expanded','false'); }); }); }

if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
} else { document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); }); }

var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

// lightweight analytics event hook (no-op unless a provider is present)
function track(name,props){ try{ if(window.plausible) window.plausible(name,{props:props||{}}); if(window.gtag) window.gtag('event',name,props||{}); }catch(e){} }
document.addEventListener('click',function(e){ var t=e.target.closest('[data-analytics]'); if(t) track(t.getAttribute('data-analytics'));
  var tel=e.target.closest('a[href^="tel:"]'); if(tel) track('phone_click');
  var ml=e.target.closest('a[href^="mailto:"]'); if(ml) track('email_click'); });

// contact form: validation + mailto handoff (CRM integration point marked below)
var wrap=document.getElementById('contactForm');
var form=document.getElementById('leadForm');
if(form){
  var interest=new URLSearchParams(location.search).get('interest');
  if(interest){ var sel=form.querySelector('#f-interest'); if(sel){ Array.from(sel.options).forEach(function(o){ if(o.value.toLowerCase().indexOf(interest.toLowerCase())>-1) sel.value=o.value; }); } }
  function invalid(id,cond){ var f=document.getElementById(id).closest('.field'); f.classList.toggle('invalid',cond); return cond; }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(form.company_website && form.company_website.value){ return; } // honeypot
    var bad=false;
    bad = invalid('f-name', !form.name.value.trim()) || bad;
    bad = invalid('f-email', !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(form.email.value.trim())) || bad;
    bad = invalid('f-company', !form.company.value.trim()) || bad;
    bad = invalid('f-consent', !form.consent.checked) || bad;
    if(bad){ var fi=form.querySelector('.invalid input,.invalid select'); if(fi) fi.focus(); return; }
    track('contact_submit',{interest:form.interest.value});
    // CRM INTEGRATION PLACEHOLDER:
    // Replace the mailto handoff below with a POST to your CRM / form endpoint.
    var sub=encodeURIComponent('Enquiry — '+form.interest.value+' — '+form.company.value);
    var body=encodeURIComponent('Name: '+form.name.value+'\\nEmail: '+form.email.value+'\\nCompany: '+form.company.value+'\\nJob title: '+form.jobtitle.value+'\\nCountry: '+form.country.value+'\\nArea of interest: '+form.interest.value+'\\n\\nProject summary:\\n'+form.message.value);
    window.location.href='mailto:${site.contact.email}?subject='+sub+'&body='+body;
    if(wrap) wrap.classList.add('sent');
  });
}

// cookie banner
try{
  var ck=document.getElementById('cookie'); var stored=localStorage.getItem('itx_cookie');
  if(ck && !stored){ ck.classList.remove('hide'); }
  document.addEventListener('click',function(e){ var b=e.target.closest('[data-cookie]'); if(!b) return;
    localStorage.setItem('itx_cookie', b.getAttribute('data-cookie')); if(ck) ck.classList.add('hide'); track('cookie_'+b.getAttribute('data-cookie')); });
}catch(e){}
})();`;
