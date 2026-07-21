/* =========================================================================
   Static site generator for the T3 Solutions website.
   Run: npm run build  →  outputs to ./dist
   ========================================================================= */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { site } from "./src/data/site.mjs";
import { services } from "./src/data/services.mjs";
import { industries } from "./src/data/industries.mjs";
import { APP_JS } from "./src/lib/layout.mjs";
import * as P from "./src/lib/pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");

/* ---- assemble routes ---- */
const routes = [];
const add = (p, html) => routes.push({ path: p, html });

add("/", P.home());
add("/services/", P.servicesIndex());
services.forEach((s) => add(`/services/${s.slug}/`, P.servicePage(s)));
add("/industries/", P.industriesIndex());
industries.forEach((i) => add(`/industries/${i.slug}/`, P.industryPage(i)));
add("/solutions/", P.solutionsPage());
add("/about/", P.aboutPage());
add("/contact/", P.contactPage());
add("/partners/", P.partnersPage());
add("/careers/", P.careersPage());
add("/insights/", P.insightsPage());
P.legalPages().forEach((l) => add(l.path, l.html));
add("/ar/", P.arabicHome());
add("/404.html", P.notFound());

/* ---- write helpers ---- */
async function writeRoute(r) {
  let file;
  if (r.path.endsWith(".html")) file = path.join(DIST, r.path);
  else file = path.join(DIST, r.path, "index.html");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, r.html, "utf8");
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

/* ---- sitemap / robots / manifest ---- */
function sitemap() {
  const indexable = routes.filter((r) =>
    !r.path.endsWith(".html") && !r.path.startsWith("/legal/") && r.path !== "/ar/");
  const today = new Date().toISOString().slice(0, 10);
  const urls = indexable.map((r) => {
    const pri = r.path === "/" ? "1.0" : r.path.split("/").filter(Boolean).length <= 1 ? "0.8" : "0.7";
    return `  <url><loc>${site.domain}${r.path}</loc><lastmod>${today}</lastmod><priority>${pri}</priority></url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    .replace("www.sitemap.org", "www.sitemaps.org");
}

const robots = `User-agent: *
Allow: /
Disallow: /legal/

Sitemap: ${site.domain}/sitemap.xml
`;

const webmanifest = JSON.stringify({
  name: site.name, short_name: "T3", start_url: "/", display: "standalone",
  background_color: "#03141b", theme_color: "#03141b",
  icons: [{ src: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
}, null, 2);

/* ---- build ---- */
async function build() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  for (const r of routes) await writeRoute(r);

  await copyDir(path.join(__dirname, "assets"), path.join(DIST, "assets"));
  await fs.copyFile(path.join(__dirname, "src/styles/styles.css"), path.join(DIST, "styles.css"));
  await fs.writeFile(path.join(DIST, "app.js"), APP_JS, "utf8");
  await fs.writeFile(path.join(DIST, "sitemap.xml"), sitemap(), "utf8");
  await fs.writeFile(path.join(DIST, "robots.txt"), robots, "utf8");
  await fs.writeFile(path.join(DIST, "site.webmanifest"), webmanifest, "utf8");

  console.log(`✓ Built ${routes.length} pages → dist/`);
  console.log(`  ${services.length} services · ${industries.length} industries`);
}

build().catch((e) => { console.error(e); process.exit(1); });
