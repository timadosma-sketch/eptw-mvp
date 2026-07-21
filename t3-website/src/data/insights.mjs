/* =========================================================================
   Insights / Knowledge Centre. Categories always render. Individual articles
   render only when site.flags.publishInsightsArticles is true (avoids
   publishing low-quality filler; pillar drafts require editorial review).
   Full editorial plan lives in SEO_CONTENT_ROADMAP.md.
   ========================================================================= */

export const insightCategories = [
  { id: "sap", title: "SAP Transformation", desc: "S/4HANA, Ariba, SuccessFactors, BTP, clean core and AMS." },
  { id: "ai", title: "Enterprise AI", desc: "AI strategy, assistants and agents, RAG and responsible adoption." },
  { id: "integration", title: "Integration & Architecture", desc: "API strategy, event-driven architecture and integration governance." },
  { id: "automation", title: "Automation", desc: "RPA, document intelligence, workflow and process mining." },
  { id: "cloud", title: "Cloud & Infrastructure", desc: "Cloud strategy, migration, resilience and data residency." },
  { id: "managed", title: "Managed Services", desc: "AMS models, SLA design, ITSM and service improvement." },
  { id: "strategy", title: "Digital Strategy", desc: "Transformation strategy, governance and enterprise architecture." },
  { id: "gcc", title: "Qatar & GCC", desc: "Regional enterprise technology trends and transformation." },
];

/* Pillar pages (status: 'planned' until reviewed & approved for publication). */
export const insightPillars = [
  { slug: "sap-transformation-qatar", category: "sap", title: "SAP Transformation in Qatar: A Practical Guide", excerpt: "How enterprises in Qatar can approach S/4HANA, clean core and long-term SAP value." },
  { slug: "enterprise-ai-qatar", category: "ai", title: "Enterprise AI in Qatar: From Use Cases to Value", excerpt: "A grounded approach to prioritising, governing and scaling enterprise AI." },
  { slug: "enterprise-integration-qatar", category: "integration", title: "Enterprise Integration: Building a Connected Estate", excerpt: "API strategy, event-driven architecture and integration governance for the enterprise." },
  { slug: "business-process-automation-qatar", category: "automation", title: "Business Process Automation That Scales", excerpt: "Combining RPA, workflow and document intelligence under real governance." },
  { slug: "managed-services-qatar", category: "managed", title: "Managed Services and SAP AMS Operating Models", excerpt: "Designing SLAs, ITSM governance and continuous improvement that last." },
];

export const insightArticles = []; // populated by editorial team; see roadmap
