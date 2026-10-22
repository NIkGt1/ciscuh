(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const canHover = finePointer && !reduceMotion;

  const FILE_NAME = "4 NETWURK.pkt";
  const CHECKSUM = "4F85D6795B290BC494323B4B00A2BC8E4500F433C7C2E30076AE3B7973AB27DE";

  /* Current year -------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Header state + scroll progress --------------------------------- */
  const header = $("#siteHeader");
  const progress = $("#scrollProgress");
  let scrollTicking = false;

  const updateScrollUI = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", scrollY > 24);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(scrollY / max, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }
    scrollTicking = false;
  };

  const requestScrollUI = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  };

  window.addEventListener("scroll", requestScrollUI, { passive: true });
  window.addEventListener("resize", requestScrollUI, { passive: true });
  updateScrollUI();

  /* Scroll reveals ------------------------------------------------ */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Active nav link ----------------------------------------------- */
  const navLinks = $$("[data-nav]");
  const navSections = ["top", "file", "verify", "open", "download"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navLinks.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", id !== "top" && id !== "download" && link.dataset.nav === id);
          });
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );
    navSections.forEach((section) => navObserver.observe(section));
  }

  /* File-card tilt ------------------------------------------------ */
  const tiltCard = $("[data-tilt]");
  if (tiltCard && canHover) {
    let tiltFrame = null;

    tiltCard.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      if (tiltFrame) window.cancelAnimationFrame(tiltFrame);

      tiltFrame = window.requestAnimationFrame(() => {
        const rect = tiltCard.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-y * 3.6).toFixed(2);
        const rotateY = (x * 5.2).toFixed(2);

        tiltCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${(x * 5).toFixed(2)}px, ${(y * 5).toFixed(2)}px, 0)`;
        tiltCard.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
        tiltCard.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
      });
    });

    const resetTilt = () => {
      if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
      tiltCard.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)";
      tiltCard.style.setProperty("--mx", "78%");
      tiltCard.style.setProperty("--my", "4%");
    };

    tiltCard.addEventListener("pointerleave", resetTilt);
    tiltCard.addEventListener("blur", resetTilt);
  }

  /* Card spotlight ------------------------------------------------ */
  if (canHover) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      });
    });
  }

  /* Cursor glow --------------------------------------------------- */
  const glow = $("#cursorGlow");
  if (glow && canHover) {
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let glowX = pointerX;
    let glowY = pointerY;
    let glowVisible = false;

    window.addEventListener(
      "pointermove",
      (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!glowVisible) {
          glowVisible = true;
          glow.style.opacity = "1";
        }
      },
      { passive: true }
    );

    const animateGlow = () => {
      glowX += (pointerX - glowX) * 0.14;
      glowY += (pointerY - glowY) * 0.14;
      glow.style.transform = `translate3d(${glowX - 310}px, ${glowY - 310}px, 0)`;
      window.requestAnimationFrame(animateGlow);
    };
    window.requestAnimationFrame(animateGlow);
  }

  /* Magnetic buttons ---------------------------------------------- */
  if (canHover) {
    $$(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.09;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
        button.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  /* Toast --------------------------------------------------------- */
  const toast = $("#toast");
  const toastMessage = $(".toast__message", toast || document);
  let toastTimer = null;

  const showToast = (message) => {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3400);
  };

  /* Download ------------------------------------------------------ */
  $$("[data-download]").forEach((link) => {
    link.addEventListener("click", () => {
      showToast(`Download started — ${FILE_NAME} · 65.4 KB`);

      if (!link.classList.contains("btn--primary")) return;
      if (link.dataset.busy === "true") return;

      const label = $("[data-download-label]", link);
      if (!label) return;

      link.dataset.busy = "true";
      link.classList.add("is-downloaded");
      const originalLabel = label.textContent;
      label.textContent = "Download started";

      window.setTimeout(() => {
        label.textContent = originalLabel;
        link.classList.remove("is-downloaded");
        link.dataset.busy = "false";
      }, 2800);
    });
  });

  /* Copy checksum ------------------------------------------------- */
  const copyFallback = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(textarea);
    return copied;
  };

  const copyChecksum = async () => {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(CHECKSUM);
        copied = true;
      } else {
        copied = copyFallback(CHECKSUM);
      }
    } catch (error) {
      copied = copyFallback(CHECKSUM);
    }

    if (!copied) {
      showToast("Couldn’t copy automatically — select the hash manually.");
      return;
    }

    showToast("SHA-256 fingerprint copied to clipboard.");

    $$("[data-copy-checksum]").forEach((button) => {
      const label = $("[data-copy-label]", button);
      if (!label) return;
      if (!button.dataset.originalLabel) button.dataset.originalLabel = label.textContent;
      button.classList.add("is-copied");
      label.textContent = "Copied";

      window.setTimeout(() => {
        label.textContent = button.dataset.originalLabel;
        button.classList.remove("is-copied");
      }, 2400);
    });
  };

  $$("[data-copy-checksum]").forEach((button) => {
    button.addEventListener("click", copyChecksum);
  });

  /* Pause SVG motion for reduced-motion preferences --------------- */
  if (reduceMotion) {
    $$("svg").forEach((svg) => {
      try {
        if (typeof svg.pauseAnimations === "function") svg.pauseAnimations();
      } catch (error) {
        /* no-op */
      }
    });
  }
})();
