// Minimal interactions: scroll-state nav, reveal-on-view, mobile menu, form UX, scroller controls

(() => {
  // --- Nav scroll state + mobile toggle ---
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav__burger");
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (burger) {
      burger.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        document.documentElement.style.overflow = open ? "hidden" : "";
      });
    }
  }

  // --- Reveal on scroll ---
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  // --- Newsletter form no-op ---
  document.querySelectorAll(".nl-form").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = f.querySelector("button");
      if (!btn) return;
      btn.innerHTML =
        "You're in <svg width='14' height='14' viewBox='0 0 14 14' aria-hidden><path d='M2 7l4 4 6-7' stroke='currentColor' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>";
      btn.disabled = true;
    });
  });

  // --- Contact/booking form no-op ---
  document.querySelectorAll(".form-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.classList.add("is-hidden");
      const succ = form.parentElement?.querySelector(".form-success");
      if (succ) succ.classList.add("is-on");
    });
  });

  // --- Arrow scroller controls (legacy snap scrollers) ---
  document.querySelectorAll("[data-scroller]").forEach((scroller) => {
    const target = document.querySelector(
      `[data-scroller-target="${scroller.dataset.scroller}"]`
    );
    if (!target) return;
    scroller.addEventListener("click", () => {
      const dir = scroller.dataset.dir === "prev" ? -1 : 1;
      target.scrollBy({ left: dir * target.clientWidth * 0.7, behavior: "smooth" });
    });
  });

  // --- Testimonial cards: rotate content through all testimonials ---
  document.querySelectorAll("[data-testi-cards]").forEach((root) => {
    const cards = Array.from(root.querySelectorAll(".testi-card"));
    if (!cards.length) return;

    const initialsFor = (name) =>
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const testimonials = [
      { quote: "\u201CSudharsanan changed how I think about showing up online. Within 90 days, inbound tripled.\u201D", name: "Rohan Mehta", role: "Founder, B2B SaaS" },
      { quote: "\u201CThe most practical personal branding mentor I\u2019ve worked with. No fluff. Only what works.\u201D", name: "Priya Narayan", role: "CXO, Fintech" },
      { quote: "\u201CHe doesn\u2019t sell a formula. He sharpens your point of view until it cuts through.\u201D", name: "Arvind Kumar", role: "Serial Entrepreneur" },
      { quote: "\u201CI\u2019ve sat through a lot of keynotes. Sudharsanan\u2019s is the one my team still quotes.\u201D", name: "Nisha Raghavan", role: "VP People, F500" },
      { quote: "\u201CThe clarity he brought to our founders\u2019 narrative moved the needle on fundraising.\u201D", name: "Karthik S.", role: "Managing Partner, VC" },
      { quote: "\u201CHe made me realize the work I\u2019d already done was the story. I just wasn\u2019t telling it.\u201D", name: "Meera V.", role: "Creative Director" },
    ];

    let offset = 0;
    let timer;
    const INTERVAL = 4200;
    const SWAP_DELAY = 380;

    const render = () => {
      cards.forEach((card, i) => {
        card.classList.add("is-swapping");
        setTimeout(() => {
          const t = testimonials[(offset + i) % testimonials.length];
          const q = card.querySelector(".testi-card__quote");
          const n = card.querySelector(".testi-card__name");
          const r = card.querySelector(".testi-card__role");
          const a = card.querySelector(".testi-card__avatar");
          if (q) q.textContent = t.quote;
          if (n) n.textContent = t.name;
          if (r) r.textContent = t.role;
          if (a) a.textContent = initialsFor(t.name);
          card.classList.remove("is-swapping");
        }, SWAP_DELAY + i * 70);
      });
    };

    const start = () => {
      stop();
      timer = setInterval(() => {
        offset = (offset + 1) % testimonials.length;
        render();
      }, INTERVAL);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting ? start() : stop()));
        },
        { threshold: 0.2 }
      );
      io.observe(root);
    } else {
      start();
    }
  });

  // --- Auto-loop gallery (pause + step) ---
  document.querySelectorAll("[data-gallery]").forEach((track) => {
    let paused = false;
    let manualOffset = 0;
    const stepPx = 280;

    const syncTransform = () => {
      if (paused) {
        track.style.transform = `translateX(${manualOffset}px)`;
      } else {
        track.style.transform = "";
      }
    };

    const controls = document.querySelectorAll("[data-gallery-btn]");
    controls.forEach((btn) => {
      const action = btn.dataset.galleryBtn;
      btn.addEventListener("click", () => {
        if (action === "pause") {
          paused = !paused;
          track.classList.toggle("is-paused", paused);
          btn.setAttribute("aria-pressed", String(paused));
          btn.setAttribute("aria-label", paused ? "Play" : "Pause");
          btn.innerHTML = paused
            ? '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2v8l7-4-7-4z" fill="currentColor"/></svg>'
            : '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="3" y="2" width="2" height="8" fill="currentColor"/><rect x="7" y="2" width="2" height="8" fill="currentColor"/></svg>';
          syncTransform();
        } else {
          if (!paused) {
            paused = true;
            track.classList.add("is-paused");
            const pauseBtn = document.querySelector(
              '[data-gallery-btn="pause"]'
            );
            if (pauseBtn) {
              pauseBtn.setAttribute("aria-pressed", "true");
              pauseBtn.setAttribute("aria-label", "Play");
              pauseBtn.innerHTML =
                '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2v8l7-4-7-4z" fill="currentColor"/></svg>';
            }
            const cs = getComputedStyle(track).transform;
            const m = cs.match(/matrix.*\((.+)\)/);
            if (m) {
              const values = m[1].split(", ").map(Number);
              manualOffset = values.length === 6 ? values[4] : values[12];
            }
          }
          const dir = action === "prev" ? 1 : -1;
          manualOffset += dir * stepPx;
          const halfWidth = track.scrollWidth / 2;
          if (manualOffset > 0) manualOffset -= halfWidth;
          if (manualOffset < -halfWidth) manualOffset += halfWidth;
          track.style.transition = "transform 600ms cubic-bezier(0.22,1,0.36,1)";
          track.style.transform = `translateX(${manualOffset}px)`;
          setTimeout(() => {
            track.style.transition = "";
          }, 640);
        }
      });
    });
  });
})();
