/* =========================================================
   T3 Solutions — site interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Portfolio data (from company portfolio) ---------- */
  var PROJECTS = [
    {
      title: "SAFETRACK HSE Automation Platform",
      tag: "HSE Platform",
      cat: ["hse", "enterprise"],
      desc: "End-to-end health, safety & environment automation platform digitizing incident, permit and compliance workflows.",
      stack: ["Web", "Mobile", "Analytics"],
      grad: ["#0a6fa0", "#063049"], glyph: "shield"
    },
    {
      title: "AI Computer Vision Safety System",
      tag: "Oil Refinery",
      cat: ["ai", "hse"],
      desc: "Real-time video analytics detecting PPE violations and hazard-zone breaches across an oil refinery.",
      stack: ["Computer Vision", "Deep Learning"],
      grad: ["#0795cb", "#0a6fa0"], glyph: "eye"
    },
    {
      title: "Intellectual Safety System for Well Maintenance",
      tag: "Field Safety",
      cat: ["ai", "hse"],
      desc: "AI-assisted safety monitoring for well maintenance works, reducing operational risk in the field.",
      stack: ["AI", "IoT"],
      grad: ["#0a6fa0", "#052635"], glyph: "shield"
    },
    {
      title: "Electronic Permit to Work",
      tag: "Oil & Gas",
      cat: ["hse", "enterprise"],
      desc: "Digital permit-to-work system managing isolation, gas testing, approvals and handover for an oil & gas company.",
      stack: ["Web", "Workflow"],
      grad: ["#ffb81c", "#c77f00"], glyph: "doc", dark: true
    },
    {
      title: "Real-Time Employee Tracking System",
      tag: "IoT & Safety",
      cat: ["ai", "hse"],
      desc: "Location-aware tracking of field personnel for safety, mustering and productivity insights.",
      stack: ["IoT", "Real-time"],
      grad: ["#0795cb", "#052635"], glyph: "pin"
    },
    {
      title: "Digital Twin for Electric Grid Operator",
      tag: "Utilities",
      cat: ["ai", "enterprise"],
      desc: "A live digital twin of an electric grid enabling simulation, monitoring and operational optimization.",
      stack: ["Digital Twin", "Big Data"],
      grad: ["#0a6fa0", "#063049"], glyph: "grid"
    },
    {
      title: "Equipment Maintenance & Inspection App",
      tag: "Oil Refinery",
      cat: ["mobile", "enterprise"],
      desc: "Mobile application for scheduling, executing and reporting equipment maintenance and inspections.",
      stack: ["Mobile", "Offline-first"],
      grad: ["#0795cb", "#0a6fa0"], glyph: "phone"
    },
    {
      title: "AI Predictive Analytics for Equipment Failure",
      tag: "Oil Refinery",
      cat: ["ai"],
      desc: "Machine-learning models forecasting equipment failures to enable proactive maintenance.",
      stack: ["Machine Learning", "Predictive"],
      grad: ["#0a6fa0", "#052635"], glyph: "chart"
    },
    {
      title: "Pre-Shift Medical Examination System",
      tag: "Healthcare",
      cat: ["enterprise", "ai"],
      desc: "Automated pre-shift medical screening ensuring workforce fitness and regulatory compliance.",
      stack: ["Web", "IoT devices"],
      grad: ["#0795cb", "#063049"], glyph: "health"
    },
    {
      title: "Mobile Application for Bank",
      tag: "Financial",
      cat: ["mobile", "enterprise"],
      desc: "Secure, feature-rich mobile banking application delivering a seamless customer experience.",
      stack: ["Mobile", "Security"],
      grad: ["#ffb81c", "#c77f00"], glyph: "phone", dark: true
    },
    {
      title: "Robotic Process Automation",
      tag: "Enterprise",
      cat: ["enterprise", "ai"],
      desc: "RPA bots automating repetitive back-office operations to cut cost and error rates.",
      stack: ["RPA", "Automation"],
      grad: ["#0a6fa0", "#063049"], glyph: "bot"
    },
    {
      title: "SAP Consulting & Implementation",
      tag: "Enterprise",
      cat: ["enterprise"],
      desc: "Design, configuration, localization and support of SAP as a long-term enterprise asset.",
      stack: ["SAP", "Integration"],
      grad: ["#0795cb", "#0a6fa0"], glyph: "sap"
    },
    {
      title: "MES / SCADA Implementation & Support",
      tag: "Industrial",
      cat: ["enterprise", "infra"],
      desc: "MES/SCADA architecture, integration with APCS/ERP/LIMS and real-time production monitoring.",
      stack: ["MES", "SCADA"],
      grad: ["#0a6fa0", "#052635"], glyph: "grid"
    },
    {
      title: "IT Infrastructure Modernization",
      tag: "Infrastructure",
      cat: ["infra"],
      desc: "Virtualization clusters, storage migration with zero downtime and corporate network core upgrades.",
      stack: ["Servers", "Networks", "Storage"],
      grad: ["#0795cb", "#063049"], glyph: "server"
    },
    {
      title: "Cybersecurity Monitoring Center (SOC)",
      tag: "Cybersecurity",
      cat: ["infra", "ai"],
      desc: "24/7 threat monitoring, SIEM correlation, incident response and OT/industrial network protection.",
      stack: ["SOC", "SIEM", "SOAR"],
      grad: ["#0a6fa0", "#063049"], glyph: "shield"
    }
  ];

  var GLYPHS = {
    shield: '<path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 3-3 3 3 5-6"/>',
    health: '<path d="M8 3H5a2 2 0 0 0-2 2v3M3 16v3a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M12 8v8M8 12h8"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
    sap: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>'
  };

  function buildProjects() {
    var grid = document.getElementById("projGrid");
    if (!grid) return;
    var html = "";
    PROJECTS.forEach(function (p) {
      var textColor = p.dark ? "#241a00" : "#ffffff";
      var meta = p.stack.map(function (s) { return '<span>' + s + "</span>"; }).join("");
      html +=
        '<article class="proj reveal" data-cat="' + p.cat.join(" ") + '">' +
          '<div class="proj__banner" style="background:linear-gradient(150deg,' + p.grad[0] + "," + p.grad[1] + ');">' +
            '<span class="pattern" style="background-image:radial-gradient(rgba(255,255,255,.28) 1px, transparent 1px);background-size:14px 14px;"></span>' +
            '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="' + textColor + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (GLYPHS[p.glyph] || GLYPHS.grid) + "</svg>" +
          "</div>" +
          '<div class="proj__body">' +
            '<span class="proj__tag">' + p.tag + "</span>" +
            "<h3>" + p.title + "</h3>" +
            "<p>" + p.desc + "</p>" +
            '<div class="proj__meta">' + meta + "</div>" +
          "</div>" +
        "</article>";
    });
    grid.innerHTML = html;
    // observe the newly added reveal elements
    grid.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Portfolio filtering ---------- */
  function initFilters() {
    var filters = document.getElementById("filters");
    if (!filters) return;
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      filters.querySelectorAll(".filter").forEach(function (f) { f.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-filter");
      document.querySelectorAll(".proj").forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat").indexOf(f) > -1;
        card.classList.toggle("hide", !show);
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var isK = el.getAttribute("data-format") === "k";
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var val = Math.floor(eased * target);
      if (isK) {
        el.textContent = (val >= 1000 ? Math.floor(val / 1000) + "k" : val) + suffix;
      } else if (target >= 2000 && !suffix) {
        el.textContent = val; // year
      } else {
        el.textContent = val + suffix;
      }
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = (isK ? Math.floor(target / 1000) + "k" : target) + (suffix || "");
    }
    requestAnimationFrame(step);
  }
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  /* ---------- Header, nav, mobile menu ---------- */
  function initNav() {
    var header = document.getElementById("header");
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");

    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    }, { passive: true });
    header.classList.toggle("scrolled", window.scrollY > 24);

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------- Contact form (mailto fallback, no backend) ---------- */
  function initForm() {
    var form = document.getElementById("leadForm");
    var wrap = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !email) { form.reportValidity && form.reportValidity(); return; }
      var subject = encodeURIComponent("Website enquiry — " + form.interest.value);
      var body = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\nInterest: " + form.interest.value +
        "\n\nMessage:\n" + form.message.value
      );
      window.location.href = "mailto:info@t3solutions.kz?subject=" + subject + "&body=" + body;
      wrap.classList.add("sent");
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    buildProjects();
    initFilters();
    initNav();
    initForm();

    document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });
    document.querySelectorAll("[data-count]").forEach(function (el) { countObserver.observe(el); });
  });
})();
