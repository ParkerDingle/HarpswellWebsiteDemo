/* ==========================================================================
   Harpswell House, Inc. — "The Quarry" shared JavaScript
   1. Gentle scroll-reveal animations (respects prefers-reduced-motion)
   2. Mobile menu toggle
   3. Lightbox for gallery images (replaces the old pop-up windows)
   ========================================================================== */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. Scroll reveals ---- */
  var revealElements = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    // Show everything immediately — no animation.
    revealElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Small stagger so groups of items ease in one after another.
            var delay = (entry.target.dataset.revealIndex || 0) * 70;
            setTimeout(function () {
              entry.target.classList.add("is-visible");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    // Assign stagger indexes within each parent group.
    var groups = {};
    revealElements.forEach(function (el) {
      var parent = el.parentElement;
      var key = parent ? Array.prototype.indexOf.call(document.querySelectorAll("*"), parent) : 0;
      groups[key] = (groups[key] || 0) + 1;
      el.dataset.revealIndex = Math.min(groups[key] - 1, 6); // cap the stagger
      observer.observe(el);
    });
  }

  /* ---- 2. Mobile menu ---- */
  var menuToggle = document.querySelector(".menu-toggle");
  var sidebar = document.getElementById("site-nav");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.textContent = open ? "Close" : "Menu";
    });
  }

  /* ---- 3. Lightbox ---- */
  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var lightboxImg = lightbox.querySelector("img");
  var lightboxCaption = lightbox.querySelector("figcaption");
  var closeButton = lightbox.querySelector(".lightbox-close");
  var lastFocused = null;

  function openLightbox(href, caption) {
    lastFocused = document.activeElement;
    lightboxImg.src = href;
    lightboxImg.alt = caption || "";
    lightboxCaption.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeLightbox() {
    function finish() {
      lightbox.hidden = true;
      lightbox.classList.remove("is-hiding");
      lightboxImg.src = "";
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    if (reducedMotion) {
      finish();
    } else {
      lightbox.classList.add("is-hiding");
      setTimeout(finish, 350); // match the CSS fade duration
    }
  }

  document.querySelectorAll(".lightbox-link").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var caption = "";
      var figure = link.closest("figure");
      if (figure) {
        var fc = figure.querySelector("figcaption");
        if (fc) caption = fc.textContent;
      }
      openLightbox(link.href, caption);
    });
  });

  closeButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
})();