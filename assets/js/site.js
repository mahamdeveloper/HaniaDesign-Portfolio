// Hania Designs — shared site behaviour. Progressive enhancement only:
// every page works with this file absent.
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  // Sticky header shadow
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      header.classList.toggle("nav-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        header.classList.remove("nav-open");
        document.body.style.overflow = "";
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        header.classList.remove("nav-open");
        document.body.style.overflow = "";
      }
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal, .reveal-img");
  if (revealEls.length) {
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  // Portfolio category filter (Work page)
  var filterBar = document.querySelector(".filters");
  if (filterBar) {
    var chips = filterBar.querySelectorAll(".chip");
    var cards = document.querySelectorAll("[data-categories]");
    var status = document.querySelector(".filter-status");
    var apply = function (cat) {
      var count = 0;
      cards.forEach(function (card) {
        var cats = card.getAttribute("data-categories").split(",");
        var show = cat === "all" || cats.indexOf(cat) !== -1;
        card.hidden = !show;
        if (show) count++;
      });
      if (status) {
        var label = cat === "all" ? "project" : cat.replace(/-/g, " ") + " project";
        status.textContent = count + " " + label + (count === 1 ? "" : "s");
      }
    };
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        apply(chip.getAttribute("data-filter"));
      });
    });
  }

  // Lightbox for zoomable case-study images
  var lightbox = document.querySelector("#lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector(".lightbox__cap");
    var opener = null;
    document.querySelectorAll(".zoomable").forEach(function (btn) {
      btn.addEventListener("click", function () {
        opener = btn;
        var full = btn.getAttribute("data-full") || btn.querySelector("img").src;
        lbImg.src = full;
        lbImg.alt = btn.querySelector("img").alt || "";
        lbCap.textContent = btn.getAttribute("data-caption") || "";
        if (typeof lightbox.showModal === "function") lightbox.showModal();
      });
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", function () {
      lbImg.src = "";
      if (opener) opener.focus();
    });
  }

  // Contact form — client-side validation + local confirmation (no backend wired up)
  var form = document.querySelector("#contact-form");
  if (form) {
    var result = document.querySelector("#form-result");
    var showError = function (field, msg) {
      field.setAttribute("aria-invalid", "true");
      var err = field.parentElement.querySelector(".field__error");
      if (err) err.textContent = msg;
    };
    var clearError = function (field) {
      field.removeAttribute("aria-invalid");
      var err = field.parentElement.querySelector(".field__error");
      if (err) err.textContent = "";
    };
    var validators = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address."; },
      project: function (v) { return v ? "" : "Choose a project type."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Tell me a little more about the project (10+ characters)."; }
    };
    Object.keys(validators).forEach(function (name) {
      var field = form.elements[name];
      if (field) field.addEventListener("blur", function () {
        var msg = validators[name](field.value);
        if (msg) showError(field, msg); else clearError(field);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      Object.keys(validators).forEach(function (name) {
        var field = form.elements[name];
        if (!field) return;
        var msg = validators[name](field.value);
        if (msg) { showError(field, msg); valid = false; } else { clearError(field); }
      });
      if (!valid) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        project: form.elements.project.value,
        message: form.elements.message.value.trim()
      };
      var subject = "New project inquiry — " + data.name;
      var body = "Name: " + data.name + "\nEmail: " + data.email + "\nProject type: " + data.project + "\n\n" + data.message;
      var mailto = "mailto:haniassan654@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (result) {
        result.hidden = false;
        result.querySelector("pre").textContent = body;
        var mailLink = result.querySelector(".js-mailto");
        if (mailLink) mailLink.href = mailto;
        result.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }
})();
