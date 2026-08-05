/* =========================================================================
   Central site configuration — edit this file to update brand, navigation,
   contact details, and content-governance flags without touching templates.
   ========================================================================= */

export const site = {
  name: "ITX",
  legalName: "ITX",
  domain: "https://www.t3solutions.kz",           // [VERIFY] update to the confirmed ITX domain when available
  locale: "en",
  tagline: "Enterprise Technology Partner for Qatar",
  description:
    "ITX is an enterprise technology and digital transformation partner helping organisations in Qatar and the GCC modernise core systems, integrate complex landscapes, automate processes and deliver measurable digital outcomes across SAP, AI, cloud, integration and managed services.",

  /* ---- Verified contact details (from company overview). Confirm before launch. ---- */
  contact: {
    phone: "+7 701 745 8899",                     // [VERIFY] confirm Qatar number for GCC audience
    phoneHref: "tel:+77017458899",
    email: "info@t3solutions.kz",                  // [VERIFY] confirm the ITX email address to display
    website: "www.t3solutions.kz",
    linkedin: "https://www.linkedin.com/",         // [VERIFY] add official company LinkedIn URL
  },

  /* ---- Offices: only render entries confirmed as a genuine presence. ---- */
  offices: [
    { city: "Doha", country: "Qatar", note: "Regional engagement", verified: false },
    { city: "Almaty", country: "Kazakhstan", address: "Taimanova 230", verified: true },
    { city: "Atyrau", country: "Kazakhstan", address: "Kurmangazy 5", verified: true },
  ],

  /* ---- Content-governance flags. Keep unverified proof switched OFF. ---- */
  flags: {
    // Company-provided figures from the official overview deck. Confirm with
    // management before public launch (see WEBSITE_CONTENT_APPROVAL_CHECKLIST.md).
    showMetrics: true,
    showClientLogos: false,        // [APPROVED CLIENT LOGO REQUIRED]
    showPartnerLogos: false,       // [PARTNERSHIP STATUS TO BE VERIFIED]
    showTestimonials: false,       // [APPROVED CASE STUDY / TESTIMONIAL REQUIRED]
    publishCaseStudies: false,     // case-study architecture built; hidden until approved
    publishInsightsArticles: false,// article templates built; pillar drafts pending review
    enableCybersecurityService: false, // [CAPABILITY TO BE VERIFIED] — off until confirmed
    analyticsId: "",               // set GA4 / Plausible ID to enable analytics
  },

  metrics: [
    { value: "2018", label: "Operating since" },
    { value: "30+", label: "Specialists & engineers" },
    { value: "50+", label: "Delivered engagements" },
    { value: "100k+", label: "Users served" },
  ],

  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "Email", href: "mailto:info@t3solutions.kz", icon: "mail" },
  ],
};

/* ---------- Primary navigation (dropdowns generated from data files) ---------- */
export const nav = [
  { label: "What We Do", href: "/services/", dropdown: "services" },
  { label: "Industries", href: "/industries/", dropdown: "industries" },
  { label: "Solutions", href: "/solutions/" },
  { label: "Insights", href: "/insights/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

/* ---------- Footer columns ---------- */
export const footerCols = [
  {
    title: "Capabilities",
    links: [
      { label: "SAP Consulting", href: "/services/sap-consulting-qatar/" },
      { label: "Enterprise Integration", href: "/services/enterprise-integration-qatar/" },
      { label: "Enterprise AI", href: "/services/enterprise-ai-qatar/" },
      { label: "Process Automation", href: "/services/business-process-automation-qatar/" },
      { label: "Managed Services", href: "/services/managed-services-qatar/" },
      { label: "All capabilities", href: "/services/" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Government", href: "/industries/government/" },
      { label: "Energy & Utilities", href: "/industries/energy-utilities/" },
      { label: "Oil & Gas", href: "/industries/oil-gas/" },
      { label: "Telecommunications", href: "/industries/telecommunications/" },
      { label: "Banking & Finance", href: "/industries/banking-financial-services/" },
      { label: "All industries", href: "/industries/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about/" },
      { label: "Solutions", href: "/solutions/" },
      { label: "Insights", href: "/insights/" },
      { label: "Partners", href: "/partners/" },
      { label: "Careers", href: "/careers/" },
      { label: "Contact", href: "/contact/" },
    ],
  },
  {
    title: "Engage",
    links: [
      { label: "Discuss a transformation", href: "/contact/?interest=Transformation" },
      { label: "Discuss an SAP project", href: "/contact/?interest=SAP" },
      { label: "Managed services", href: "/contact/?interest=Managed%20Services" },
      { label: "Partner enquiry", href: "/partners/#enquire" },
    ],
  },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy/" },
  { label: "Terms of Use", href: "/legal/terms/" },
  { label: "Cookie Policy", href: "/legal/cookies/" },
];
