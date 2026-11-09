/* ═══════════════════════════════════════════════════════════════
   TAZE GROSS — tanıtım sitesi etkileşimleri
   ═══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ 1. HEADER ═══ */
  {
    const hdr = $("#hdr");
    const onScroll = () => hdr.classList.toggle("is-scrolled", scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    $("#burger").addEventListener("click", () =>
      document.body.classList.toggle("menu-open"));
    $$("#hdrMobile a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  }

  /* ═══ 1b. TEMA DEĞİŞTİRİCİ ═══ */
  {
    $("#themeSwitch").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("tg-theme", next); } catch {}
    });
  }

  /* ═══ 2. REVEAL ═══ */
  {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14 });
    $$(".reveal, .feat").forEach((el) => io.observe(el));
  }

  /* ═══ 3. SAYAÇLAR ═══ */
  {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target;
        const target = +el.dataset.count;
        const start = performance.now();
        const step = (now) => {
          const p = clamp((now - start) / 1500, 0, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 4)) * target).toLocaleString("tr-TR");
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach((el) => io.observe(el));
  }

  /* ═══ 4. HERO PARALLAX — sebzeler fareyi izler ═══ */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    const art = $("#heroArt");
    const vegs = $$(".veg", art).map((el) => ({ el, d: +el.dataset.depth || 15 }));
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      vegs.forEach(({ el, d }) => {
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else raf = null;
    };
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5);
      ty = (e.clientY / innerHeight - 0.5);
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ═══ 5. CANLI SAAT + AÇIK/KAPALI ═══ */
  {
    const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const clock = $("#liveClock");
    const day = $("#liveDay");
    const status = $("#visitStatus");
    const rows = $$("#hoursList > div");
    const update = () => {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      day.textContent = DAYS[now.getDay()];
      const open = now.getHours() >= 8 && now.getHours() < 22;
      status.classList.toggle("is-closed", !open);
      status.querySelector("span").textContent = open
        ? "Mağazamız şu an açık!"
        : "Şu an kapalıyız — 08:00'de görüşürüz!";
      const idx = (now.getDay() + 6) % 7; // pazartesi = 0
      rows.forEach((row, i) => row.classList.toggle("is-today", i === idx));
    };
    update();
    setInterval(update, 30_000);
    $("#year").textContent = new Date().getFullYear();
  }

})();
