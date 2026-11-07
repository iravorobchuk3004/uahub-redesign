(() => {
  const { CITIES, CATEGORIES, SPECIALISTS, REVIEWS, toMap, img, byId, catLabel } = window.UAHUB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const qs = new URLSearchParams(location.search);
  // ?figma — static render for importing into Figma (no scroll reveals or motion)
  if (qs.has("figma")) document.documentElement.classList.add("no-motion");

  /* ---------- Icons ---------- */
  const PATHS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    verified: '<path d="m12 2.8 2.3 1.7 2.8-.1.9 2.7 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.7-2.8-.1L12 21.2l-2.3-1.7-2.8.1-.9-2.7-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.7 2.8.1z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    map: '<path d="m9 4-5.5 2v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12Z"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.3 2.9 8 7 9.5 4.1-1.5 7-5.2 7-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  };
  const icon = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${PATHS[n] || ""}</svg>`;
  $$("[data-icon]").forEach((el) => { el.outerHTML = icon(el.dataset.icon, el.className); });

  /* ---------- Saved (per-viewer convenience) ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem("uahub-saved") || "[]"); } catch { return []; } },
    set(v) { try { localStorage.setItem("uahub-saved", JSON.stringify(v)); } catch {} },
  };
  let saved = store.get();
  const syncSaved = () => {
    $$(".saved-count").forEach((el) => (el.textContent = saved.length || ""));
    $$(".heart").forEach((h) => h.setAttribute("aria-pressed", saved.includes(h.dataset.id)));
  };
  document.addEventListener("click", (e) => {
    const h = e.target.closest(".heart");
    if (!h) return;
    e.preventDefault();
    const id = h.dataset.id;
    saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    store.set(saved);
    syncSaved();
    toast(saved.includes(id) ? "Saved to your list" : "Removed from saved");
  });

  let toastTimer;
  function toast(text) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.innerHTML = icon("check", "sm") + text;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Nav & footer ---------- */
  const navHTML = `
  <header class="nav">
    <div class="wrap nav-inner">
      <a class="logo" href="index.html" aria-label="UAHUB home"><span class="logo-mark"></span>uahub</a>
      <nav class="nav-links" aria-label="Main">
        <a href="catalog.html" ${page === "catalog" ? 'aria-current="page"' : ""}>Find a specialist</a>
        <a href="catalog.html?cat=food">Businesses</a>
        <a href="index.html#events">Events</a>
      </nav>
      <div class="nav-actions">
        <a class="btn btn-ghost hide-m" href="catalog.html?saved=1">${icon("heart")} Saved <span class="saved-count"></span></a>
        <a class="btn btn-secondary btn-sm hide-m" href="business.html" ${page === "business" ? 'aria-current="page"' : ""}>For business</a>
        <a class="btn btn-dark btn-sm hide-m" href="#" data-signin>Sign in</a>
        <button class="nav-burger" aria-label="Menu" aria-expanded="false">${icon("menu")}</button>
      </div>
    </div>
  </header>
  <div class="mobile-menu">
    <a href="catalog.html">Find a specialist</a>
    <a href="catalog.html?cat=food">Businesses</a>
    <a href="index.html#events">Events</a>
    <a href="catalog.html?saved=1">Saved <span class="saved-count"></span></a>
    <a href="business.html">For business</a>
  </div>`;
  document.body.insertAdjacentHTML("afterbegin", navHTML);
  const burger = $(".nav-burger");
  burger.addEventListener("click", () => {
    const open = $(".mobile-menu").classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
    burger.innerHTML = icon(open ? "close" : "menu");
  });
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-signin]")) { e.preventDefault(); toast("Sign-in is out of scope for this prototype"); }
  });

  const footer = $("footer[data-footer]");
  if (footer) {
    footer.className = "footer";
    footer.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="logo" href="index.html"><span class="logo-mark"></span>uahub</a>
          <p style="max-width:300px;margin-top:16px">Ukrainian specialists, businesses and events across Spain — in one place, in your language.</p>
        </div>
        <div><h4>Explore</h4><ul><li><a href="catalog.html">All specialists</a></li><li><a href="catalog.html?cat=beauty">Beauty</a></li><li><a href="catalog.html?cat=legal">Legal</a></li><li><a href="index.html#events">Events</a></li></ul></div>
        <div><h4>For business</h4><ul><li><a href="business.html">List your business</a></li><li><a href="business.html#pricing">Pricing</a></li><li><a href="business.html#how">Verification</a></li><li><a href="business.html#faq">FAQ</a></li></ul></div>
        <div><h4>Project</h4><ul><li><a href="https://uahub.world" target="_blank" rel="noopener">Original site ↗</a></li></ul></div>
      </div>
      <div class="footer-bottom"><span>© 2026 UAHUB · Redesign concept by Iryna Vorobchuk</span><span>Prototype — names and businesses are fictional · Photos: Unsplash</span></div>
    </div>`;
  }

  /* ---------- Shared renderers ---------- */
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const initials = (name) => name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const avatar = (s, cls = "avatar") =>
    s.avatar ? `<img class="${cls}" src="${img(s.avatar)}" alt="" loading="lazy">` : `<span class="${cls}">${initials(s.name)}</span>`;
  const priceText = (s) => (s.unit === "avg. bill" ? `<b>€${s.price}</b> avg.` : s.unit ? `<b>€${s.price}</b> ${s.unit}` : `From <b>€${s.price}</b>`);
  const kmText = (s) => (s.km ? `${s.city} · ${s.km} km` : `${s.city} · Online`);
  const stars = (n) => `<span class="stars" aria-label="${n} of 5">${icon("star", "sm fill").repeat(n)}</span>`;

  const card = (s) => `
    <article class="card" data-id="${s.id}">
      <div class="card-media">
        <img src="${img(s.img)}" alt="" loading="lazy">
        <span class="pill-tag">${catLabel(s.cat)}</span>
        <button class="heart" data-id="${s.id}" aria-label="Save ${s.name}" aria-pressed="false">${icon("heart")}</button>
      </div>
      <div class="card-body">
        <div class="card-row">
          <span class="rating">${icon("star", "sm fill")}${s.rating.toFixed(1)} <span>(${s.reviews})</span></span>
          ${s.verified ? `<span class="badge badge-verified">${icon("verified", "sm")}Verified</span>` : ""}
        </div>
        <h3 class="card-title"><a href="specialist.html?id=${s.id}">${s.title}</a></h3>
        <div class="person">${avatar(s)}<span>${s.name}</span></div>
        <div class="card-foot"><span class="muted">${icon("pin", "sm")} ${kmText(s)}</span><span>${priceText(s)}</span></div>
      </div>
    </article>`;

  // Spread pins of the same city in a small ring so faces don't stack.
  const pinPositions = (list) => {
    const seen = {};
    return list.map((s) => {
      const c = CITIES[s.city];
      const p = toMap(c.lon, c.lat);
      const i = (seen[s.city] = (seen[s.city] ?? -1) + 1);
      if (i === 0) return { s, ...p };
      const a = Math.PI / 2 + ((i - 1) % 5) * (Math.PI / 4); // fan out inland (west), most cities are coastal
      const r = 8 + Math.floor((i - 1) / 5) * 6;
      return { s, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 1.1 };
    });
  };
  const pinHTML = ({ s, x, y }) => `
    <a class="pin" href="specialist.html?id=${s.id}" data-id="${s.id}" style="left:${x}%;top:${y}%" aria-label="${s.name}, ${s.city}">
      ${s.avatar ? `<img class="face" src="${img(s.avatar)}" alt="">` : `<span class="face">${initials(s.name)}</span>`}
    </a>`;

  /* ---------- Reveal ---------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { rootMargin: "0px 0px -8% 0px" })
    : null;
  const reveal = () => $$(".reveal:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  /* ================= HOME ================= */
  if (page === "home") {
    const citySel = $("#hero-city");
    citySel.innerHTML = Object.keys(CITIES).map((c) => `<option ${c === "Alicante" ? "selected" : ""}>${c}</option>`).join("");
    $("#hero-search").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#hero-q").value.trim();
      location.href = `catalog.html?city=${encodeURIComponent(citySel.value)}${q ? "&q=" + encodeURIComponent(q) : ""}`;
    });

    // Hero people: pill → mini profile on hover/focus, click opens the full profile
    const short = { "iryna-melnyk": "Lawyer", "mariia-koval": "Nails", "maksym-tkachenko": "Photographer", "yulia-romanenko": "Yoga" };
    $$("[data-person]").forEach((el) => {
      const s = byId(el.dataset.person);
      const money = (x) => (x.price === 0 ? "Free" : `${x.from ? "from " : ""}€${x.price}`);
      el.href = `specialist.html?id=${s.id}`;
      el.setAttribute("aria-label", `${s.name}, ${s.title}, ${s.city}. Open profile`);
      el.innerHTML = `
        <span class="fp-head">${avatar(s, "fp-avatar")}<span><b>${s.name.split(" ")[0]}<i class="fp-last"> ${s.name.split(" ").slice(1).join(" ")}</i></b><span class="fp-sub">${short[s.id]} · ${s.city}</span></span></span>
        <span class="fp-more"><span class="fp-inner">
          <span class="fp-title">${esc(s.title)}</span>
          <span class="fp-meta"><span class="rating">${icon("star", "sm fill")}${s.rating.toFixed(1)} <span>(${s.reviews})</span></span>${s.verified ? `<span class="badge badge-verified">${icon("verified", "sm")}Verified</span>` : ""}</span>
          <span class="fp-services">${s.services.slice(0, 3).map((x) => `<span><span>${esc(x.name)}</span><b>${money(x)}</b></span>`).join("")}</span>
          <span class="fp-foot"><span class="muted">Replies ${s.replies}</span><span class="fp-cta">View profile ${icon("arrow", "sm")}</span></span>
        </span></span>`;
    });

    const nearGrid = $("#near-grid");
    const near = SPECIALISTS.filter((s) => s.city === "Alicante");
    const renderNear = (cat) => {
      const list = (cat === "all" ? near : near.filter((s) => s.cat === cat)).slice(0, 4);
      nearGrid.innerHTML = list.length ? list.map(card).join("") : `<div class="empty" style="grid-column:1/-1">Nobody here yet in this category — <a class="badge-verified" href="catalog.html?cat=${cat}">see all of Spain</a></div>`;
      syncSaved();
    };
    $$("#near-chips .chip").forEach((c) =>
      c.addEventListener("click", () => {
        $$("#near-chips .chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
        renderNear(c.dataset.cat);
      })
    );
    renderNear("all");

    // Map teaser: one count bubble per city
    const counts = {};
    SPECIALISTS.forEach((s) => (counts[s.city] = (counts[s.city] || 0) + 1));
    const fake = { Alicante: 124, Valencia: 312, Madrid: 486, Barcelona: 401, Málaga: 158, Sevilla: 61, Torrevieja: 77, Bilbao: 23 };
    $("#teaser-map").insertAdjacentHTML("beforeend", Object.entries(CITIES).filter(([n]) => n !== "Torrevieja").map(([name, c]) => {
      const p = toMap(c.lon, c.lat);
      return `<a class="city-count" href="catalog.html?city=${encodeURIComponent(name)}" style="left:${p.x}%;top:${p.y}%">${name} · ${fake[name]}</a>`;
    }).join(""));
  }

  /* ================= CATALOG ================= */
  if (page === "catalog") {
    const params = new URLSearchParams(location.search);
    const state = {
      q: params.get("q") || "",
      city: params.get("city") || "All Spain",
      cat: params.get("cat") || "all",
      verified: false,
      ukr: true,
      saved: params.get("saved") === "1",
    };
    const qInput = $("#q"), citySel = $("#city");
    qInput.value = state.q;
    citySel.innerHTML = ["All Spain", ...Object.keys(CITIES)].map((c) => `<option ${c === state.city ? "selected" : ""}>${c}</option>`).join("");
    $("#cats").innerHTML = [{ id: "all", label: "All" }, ...CATEGORIES].map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === state.cat}">${c.label}</button>`).join("");
    $("#verified").checked = state.verified;
    $("#savedOnly").checked = state.saved;

    const mapCanvas = $("#catalog-map");
    const grid = $("#results");

    const apply = () => {
      const q = state.q.toLowerCase();
      const list = SPECIALISTS.filter((s) =>
        (state.city === "All Spain" || s.city === state.city) &&
        (state.cat === "all" || s.cat === state.cat) &&
        (!state.verified || s.verified) &&
        (!state.saved || saved.includes(s.id)) &&
        (!q || [s.title, s.name, catLabel(s.cat), s.about, ...s.services.map((x) => x.name)].join(" ").toLowerCase().includes(q))
      );
      const where = state.city === "All Spain" ? "across Spain" : `in ${state.city}`;
      $("#count").innerHTML = state.saved ? `${list.length} saved` : `${list.length} ${list.length === 1 ? "specialist" : "specialists"} <span class="serif">${where}</span>`;
      grid.innerHTML = list.length
        ? list.map(card).join("")
        : `<div class="empty" style="grid-column:1/-1"><p class="h3">No matches yet</p><p class="muted">Try another city or clear the filters.</p><button class="btn btn-secondary" id="reset">Clear filters</button></div>`;
      $("#reset")?.addEventListener("click", () => {
        Object.assign(state, { q: "", city: "All Spain", cat: "all", verified: false, saved: false });
        qInput.value = ""; citySel.value = "All Spain"; $("#verified").checked = false; $("#savedOnly").checked = false;
        $$("#cats .chip").forEach((c) => c.setAttribute("aria-pressed", c.dataset.cat === "all"));
        apply();
      });
      $$(".pin, .city-count", mapCanvas).forEach((p) => p.remove());
      if (state.city === "All Spain") {
        // Overview: one cluster per city, a single pin when only one result
        const byCity = {};
        list.forEach((s) => (byCity[s.city] = byCity[s.city] || []).push(s));
        mapCanvas.insertAdjacentHTML("beforeend", Object.entries(byCity).map(([city, items]) => {
          if (items.length === 1) return pinPositions(items).map(pinHTML).join("");
          const p = toMap(CITIES[city].lon, CITIES[city].lat);
          return `<button class="city-count" data-city="${city}" style="left:${p.x}%;top:${p.y}%">${city} · ${items.length}</button>`;
        }).join(""));
      } else {
        mapCanvas.insertAdjacentHTML("beforeend", pinPositions(list).map(pinHTML).join(""));
      }
      // Zoom into the chosen city so its pins don't pile up
      const c = CITIES[state.city];
      if (c) {
        const p = toMap(c.lon, c.lat);
        mapCanvas.style.transformOrigin = `${p.x}% ${p.y}%`;
        mapCanvas.style.transform = `translate(${50 - p.x}%, ${50 - p.y}%) scale(2.6)`;
        mapCanvas.style.setProperty("--pk", 1 / 2.6);
      } else {
        mapCanvas.style.transform = "";
        mapCanvas.style.setProperty("--pk", 1);
      }
      syncSaved();
      // Keep the URL shareable
      const u = new URLSearchParams();
      if (state.q) u.set("q", state.q);
      if (state.city !== "All Spain") u.set("city", state.city);
      if (state.cat !== "all") u.set("cat", state.cat);
      if (state.saved) u.set("saved", "1");
      history.replaceState(null, "", "catalog.html" + (u.toString() ? "?" + u : ""));
    };

    let t;
    qInput.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = qInput.value.trim(); apply(); }, 150); });
    $("#catalog-search").addEventListener("submit", (e) => { e.preventDefault(); state.q = qInput.value.trim(); apply(); });
    citySel.addEventListener("change", () => { state.city = citySel.value; apply(); });
    $("#cats").addEventListener("click", (e) => {
      const c = e.target.closest(".chip"); if (!c) return;
      state.cat = c.dataset.cat;
      $$("#cats .chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
      apply();
    });
    mapCanvas.addEventListener("click", (e) => {
      const c = e.target.closest(".city-count"); if (!c) return;
      state.city = citySel.value = c.dataset.city;
      apply();
    });
    $("#verified").addEventListener("change", (e) => { state.verified = e.target.checked; apply(); });
    $("#savedOnly").addEventListener("change", (e) => { state.saved = e.target.checked; apply(); });
    document.addEventListener("click", (e) => { if (e.target.closest(".heart") && state.saved) apply(); });

    // Card ↔ pin highlight
    const hot = (id, on) => $$(`[data-id="${id}"]`).forEach((el) => (el.classList.contains("card") || el.classList.contains("pin")) && el.classList.toggle("is-hot", on));
    grid.addEventListener("mouseover", (e) => { const c = e.target.closest(".card"); if (c) hot(c.dataset.id, true); });
    grid.addEventListener("mouseout", (e) => { const c = e.target.closest(".card"); if (c) hot(c.dataset.id, false); });
    mapCanvas.addEventListener("mouseover", (e) => { const p = e.target.closest(".pin"); if (p) hot(p.dataset.id, true); });
    mapCanvas.addEventListener("mouseout", (e) => { const p = e.target.closest(".pin"); if (p) hot(p.dataset.id, false); });

    const sw = $(".view-switch");
    sw.addEventListener("click", () => {
      const on = document.body.classList.toggle("show-map");
      sw.innerHTML = on ? `${icon("list")} Show list` : `${icon("map")} Show map`;
      scrollTo(0, 0);
    });
    apply();
  }

  /* ================= SPECIALIST + BOOKING ================= */
  if (page === "specialist") {
    const s = byId(new URLSearchParams(location.search).get("id")) || SPECIALISTS[0];
    document.title = `${s.name} — ${s.title} · UAHUB`;
    const minPrice = s.price;
    const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) + " min" : ""}` : `${m} min`);
    const money = (x) => (x.price === 0 ? "Free" : `${x.from ? "from " : ""}€${x.price}`);

    // Deterministic availability for the next 14 days
    const today = new Date(2026, 10, 3);
    const DAYS = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i + 1);
      const seed = (d.getDate() * 7 + s.name.length) % 5;
      const closed = d.getDay() === 0;
      const all = ["09:00", "10:00", "11:30", "12:30", "14:00", "15:30", "16:30", "18:00"];
      const times = closed ? [] : all.filter((_, k) => (k + seed) % 3 !== 0);
      return { d, times };
    });
    const fmt = (d, o) => d.toLocaleDateString("en-GB", o);

    const gal = [s.img, ...s.gallery.filter((g) => g !== s.img)];
    while (gal.length < 5) gal.push(gal[gal.length % Math.max(1, gal.length)]);
    const sameCat = SPECIALISTS.filter((x) => x.id !== s.id && (x.cat === s.cat || x.city === s.city)).slice(0, 4);
    const firstSlots = DAYS.flatMap((day) => day.times.map((t) => ({ day, t }))).slice(0, 6);

    $("#profile").innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumbs"><a href="index.html">Home</a>${icon("chevron", "sm")}<a href="catalog.html?city=${encodeURIComponent(s.city)}">${s.city}</a>${icon("chevron", "sm")}<a href="catalog.html?cat=${s.cat}">${catLabel(s.cat)}</a></nav>
      <div class="gallery">${gal.slice(0, 5).map((g, i) => `<img src="${img(g)}" alt="" ${i ? 'loading="lazy"' : ""}>`).join("")}</div>
      <div class="profile">
        <div>
          <div class="profile-head">
            ${avatar(s)}
            <div>
              <h1>${s.name}</h1>
              <div class="meta">
                <span>${s.title}</span>
              </div>
            </div>
          </div>
          <div class="meta" style="margin-top:16px">
            <span class="rating">${icon("star", "sm fill")}${s.rating.toFixed(1)} <span>· ${s.reviews} reviews</span></span>
            ${s.verified ? `<span class="badge badge-verified">${icon("verified", "sm")}Verified by UAHUB</span>` : `<span>Not verified yet</span>`}
            <span>${icon("pin", "sm")}${s.area}, ${s.city}</span>
            <button class="heart" style="position:static;border:1px solid var(--line)" data-id="${s.id}" aria-label="Save ${s.name}" aria-pressed="false">${icon("heart")}</button>
          </div>
          <div class="facts">
            <div><b>${s.years} yrs</b><span>experience</span></div>
            <div><b>${s.replies.replace("within ", "< ")}</b><span>usual reply time</span></div>
            <div><b>${s.langs.length}</b><span>${s.langs.join(", ")}</span></div>
          </div>
          <section class="block"><h2>About</h2><p class="lead" style="color:var(--ink)">${s.about}</p></section>
          <section class="block">
            <h2>Services</h2>
            <div class="services">${s.services.map((x, i) => `
              <div class="service"><div><b>${x.name}</b><small>${dur(x.mins)}</small></div><span class="price">${money(x)}</span>
              <button class="btn btn-secondary btn-sm" data-book-service="${i}">Book</button></div>`).join("")}</div>
          </section>
          <section class="block">
            <h2>${icon("star", "fill")} ${s.rating.toFixed(1)} · ${s.reviews} reviews</h2>
            <div class="reviews">${REVIEWS.map((r) => `
              <div class="review">${stars(r.stars)}<p>“${r.text}”</p><p class="caption">${r.name} · ${r.city} · ${r.when}</p></div>`).join("")}</div>
          </section>
          <section class="block">
            <h2>Location</h2>
            <div class="map" style="max-width:520px"><div class="map-canvas"><img class="land" src="img/map-spain-white.png" alt="Map of Spain">${pinPositions([s]).map(pinHTML).join("")}</div></div>
            <p class="caption" style="margin-top:12px">${s.area}, ${s.city}. Exact address is shared after booking.</p>
          </section>
        </div>
        <aside>
          <div class="book-box">
            <div class="from">From <b>€${minPrice}</b></div>
            <p class="caption" style="margin:4px 0 0">Nearest free times</p>
            <div class="next-slots">${firstSlots.map(({ day, t }, i) => `<button class="slot" data-quick="${DAYS.indexOf(day)}|${t}"><small>${fmt(day.d, { weekday: "short", day: "numeric" })}</small>${t}</button>`).join("")}</div>
            <button class="btn btn-primary btn-block" data-book>Book a time ${icon("arrow")}</button>
            <button class="btn btn-ghost btn-block" style="margin-top:4px" data-msg>${icon("chat")} Message ${s.name.split(" ")[0]}</button>
            <div class="assure">
              <div>${icon("check", "sm")}Free cancellation up to 24 h before</div>
              <div>${icon("check", "sm")}Pay on the spot — no card needed</div>
              <div>${icon("check", "sm")}Replies ${s.replies}</div>
            </div>
          </div>
        </aside>
      </div>
      ${sameCat.length ? `<section class="section"><div class="section-head"><h2 class="h2">You may also <span class="serif">like</span></h2></div><div class="grid-cards">${sameCat.map(card).join("")}</div></section>` : ""}
      <div class="mobile-book"><div><div class="caption">From</div><b style="font-size:20px;font-weight:500">€${minPrice}</b></div><button class="btn btn-primary" data-book>Book a time</button></div>`;
    document.body.classList.add("has-mobile-book");
    syncSaved();

    /* ----- Booking sheet: 3 real steps ----- */
    const sheet = $("#sheet");
    const b = { step: 1, service: null, day: null, time: null, name: "", phone: "", note: "", via: "WhatsApp" };
    const STEPS = ["Choose a service", "Pick a day & time", "Your details"];

    const sumLine = () => {
      const sv = b.service != null ? s.services[b.service] : null;
      const when = b.day != null && b.time ? `${fmt(DAYS[b.day].d, { weekday: "short", day: "numeric", month: "short" })}, ${b.time}` : "";
      return sv ? `<b>${money(sv)}</b>${sv.name}${when ? " · " + when : ""}` : `<b>Nothing selected</b>Pick a service to continue`;
    };
    const canNext = () => (b.step === 1 ? b.service != null : b.step === 2 ? b.day != null && !!b.time : true);

    const render = () => {
      const body = $(".sheet-body", sheet);
      $(".progress", sheet).innerHTML = [1, 2, 3].map((i) => `<i class="${i <= Math.min(b.step, 3) ? "on" : ""}"></i>`).join("");
      $(".step-label", sheet).textContent = b.step <= 3 ? `Step ${b.step} of 3 · ${STEPS[b.step - 1]}` : "Done";
      $(".sheet-top .progress").style.display = $(".step-label", sheet).style.display = b.step > 3 ? "none" : "";
      $("[data-back]", sheet).style.visibility = b.step > 1 && b.step <= 3 ? "visible" : "hidden";

      if (b.step === 1) {
        body.innerHTML = s.services.map((x, i) => `
          <button class="option" role="radio" aria-checked="${b.service === i}" data-svc="${i}">
            <span class="radio"></span><div><b>${x.name}</b><small>${dur(x.mins)}</small></div><b>${money(x)}</b>
          </button>`).join("");
      } else if (b.step === 2) {
        const day = b.day != null ? DAYS[b.day] : null;
        body.innerHTML = `
          <p class="overline" style="margin:0 0 12px">${fmt(DAYS[0].d, { month: "long", year: "numeric" })}</p>
          <div class="days">${DAYS.map((d, i) => `
            <button class="day" data-day="${i}" aria-pressed="${b.day === i}" ${d.times.length ? "" : "disabled"}>
              <small>${fmt(d.d, { weekday: "short" })}</small><b>${d.d.getDate()}</b><em>${d.times.length ? d.times.length + " free" : "closed"}</em>
            </button>`).join("")}</div>
          ${day ? `<p class="overline" style="margin:0 0 12px">Free times · ${fmt(day.d, { weekday: "long", day: "numeric", month: "long" })}</p>
            <div class="times">${day.times.map((t) => `<button class="slot" data-time="${t}" aria-pressed="${b.time === t}">${t}</button>`).join("")}</div>`
            : `<p class="muted">Choose a day to see free times.</p>`}`;
      } else if (b.step === 3) {
        body.innerHTML = `
          <div class="recap">
            <div><span>Service</span><b>${s.services[b.service].name}</b></div>
            <div><span>When</span><b>${fmt(DAYS[b.day].d, { weekday: "long", day: "numeric", month: "long" })}, ${b.time}</b></div>
            <div><span>With</span><b>${s.name}</b></div>
          </div>
          <label class="field" id="f-name">Your name<input name="name" autocomplete="name" value="${esc(b.name)}" placeholder="Olena"><span class="error">Please add your name</span></label>
          <label class="field" id="f-phone">Phone<input name="phone" type="tel" autocomplete="tel" inputmode="tel" value="${esc(b.phone)}" placeholder="+34 600 000 000"><span class="hint">Only ${s.name.split(" ")[0]} sees it, to confirm your visit.</span><span class="error">Please add a phone number</span></label>
          <div class="field">How should ${s.name.split(" ")[0]} reach you?
            <div class="contact-pref">${["WhatsApp", "Telegram", "Call"].map((v) => `<button type="button" class="chip" data-via="${v}" aria-pressed="${b.via === v}">${v}</button>`).join("")}</div>
          </div>
          <label class="field">Note <span class="hint" style="display:inline">(optional)</span><textarea name="note" placeholder="E.g. I'd like a soft milky colour">${esc(b.note)}</textarea></label>`;
      } else {
        const sv = s.services[b.service];
        body.innerHTML = `
          <div class="done">
            <div class="ok">${icon("check")}</div>
            <h2 class="h2" style="font-size:36px">You're <span class="serif">booked</span>, ${esc(b.name.split(" ")[0])}!</h2>
            <p class="muted" style="margin:12px auto 24px;max-width:340px">${s.name.split(" ")[0]} will confirm on ${b.via} within ${s.replies.replace("within ", "")}. We'll remind you the day before.</p>
          </div>
          <div class="recap">
            <div><span>Service</span><b>${sv.name}</b></div>
            <div><span>When</span><b>${fmt(DAYS[b.day].d, { weekday: "long", day: "numeric", month: "long" })}, ${b.time}</b></div>
            <div><span>Where</span><b>${s.area}, ${s.city}</b></div>
            <div><span>Price</span><b>${money(sv)} · pay on the spot</b></div>
          </div>`;
      }

      $(".sum", sheet).innerHTML = sumLine();
      const next = $("[data-next]", sheet);
      next.disabled = !canNext();
      next.innerHTML = b.step === 3 ? "Confirm booking" : b.step > 3 ? "Done" : `Continue ${icon("arrow")}`;
      $(".sum", sheet).style.display = b.step > 3 ? "none" : "";
    };

    const open = (preset = {}) => {
      Object.assign(b, { step: 1 }, preset);
      if (b.service == null && s.services.length === 1) b.service = 0;
      document.body.classList.add("is-booking");
      sheet.setAttribute("aria-hidden", "false");
      render();
      setTimeout(() => $("[data-close]", sheet).focus(), 50);
    };
    // ?book=1..4 opens the booking sheet on a given step (handy for demos and Figma import)
    const bk = +qs.get("book");
    if (bk >= 1 && bk <= 4) {
      const d = DAYS.findIndex((x) => x.times.length);
      const preset = bk === 1 ? {} : { service: 0, day: d, time: DAYS[d].times[1] || DAYS[d].times[0] };
      if (bk >= 3) Object.assign(preset, { name: "Olena Hrytsenko", phone: "+34 600 123 456" });
      setTimeout(() => { open(preset); b.step = bk; render(); }, 0);
    }
    const close = () => { document.body.classList.remove("is-booking"); sheet.setAttribute("aria-hidden", "true"); };

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-book]")) open();
      const sv = e.target.closest("[data-book-service]");
      if (sv) open({ service: +sv.dataset.bookService, step: 2 });
      const q = e.target.closest("[data-quick]");
      if (q) { const [d, t] = q.dataset.quick.split("|"); open({ day: +d, time: t, service: b.service ?? null }); }
      if (e.target.closest("[data-msg]")) toast("Chat is out of scope for this prototype");
    });
    $(".sheet-backdrop").addEventListener("click", close);
    $("[data-close]", sheet).addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("is-booking")) close(); });

    sheet.addEventListener("click", (e) => {
      const svc = e.target.closest("[data-svc]");
      if (svc) { b.service = +svc.dataset.svc; render(); return; }
      const day = e.target.closest("[data-day]");
      if (day) { b.day = +day.dataset.day; if (!DAYS[b.day].times.includes(b.time)) b.time = null; render(); return; }
      const tm = e.target.closest("[data-time]");
      if (tm) { b.time = tm.dataset.time; render(); return; }
      const via = e.target.closest("[data-via]");
      if (via) { b.via = via.dataset.via; $$("[data-via]", sheet).forEach((x) => x.setAttribute("aria-pressed", x === via)); return; }
      if (e.target.closest("[data-back]")) { b.step--; render(); return; }
      if (e.target.closest("[data-next]")) {
        if (b.step > 3) return close();
        if (b.step === 3) {
          b.name = $('[name="name"]', sheet).value.trim();
          b.phone = $('[name="phone"]', sheet).value.trim();
          b.note = $('[name="note"]', sheet).value.trim();
          $("#f-name").classList.toggle("err", !b.name);
          $("#f-phone").classList.toggle("err", b.phone.replace(/\D/g, "").length < 6);
          if ($(".field.err", sheet)) { $(".field.err input", sheet).focus(); return; }
        }
        b.step++;
        render();
        $(".sheet-body", sheet).scrollTop = 0;
      }
    });
    sheet.addEventListener("input", (e) => {
      if (e.target.name) b[e.target.name] = e.target.value;
      e.target.closest(".field")?.classList.remove("err");
    });
  }

  /* ================= BUSINESS ================= */
  if (page === "business") {
    $$("[data-billing]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const y = btn.dataset.billing === "year";
        $$("[data-billing]").forEach((x) => x.setAttribute("aria-pressed", x === btn));
        $$("[data-m]").forEach((el) => (el.textContent = y ? el.dataset.y : el.dataset.m));
      })
    );
    $$("[data-plan]").forEach((a) => a.addEventListener("click", () => ($("#j-plan").value = a.dataset.plan)));
    const form = $("#join-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.biz.value.trim();
      $("#j-name").classList.toggle("err", !name);
      $("#j-phone").classList.toggle("err", form.phone.value.replace(/\D/g, "").length < 6);
      if ($(".field.err", form)) return $(".field.err input", form).focus();
      form.innerHTML = `<div class="done" style="padding:24px 0"><div class="ok">${icon("check")}</div>
        <h3 class="h2" style="font-size:32px">Welcome, <span class="serif">${esc(name)}</span></h3>
        <p class="muted" style="max-width:320px;margin:12px auto 0">We'll send a link to finish your ${esc(form.plan.value)} profile to WhatsApp within an hour.</p></div>`;
    });
  }

  syncSaved();
  reveal();
})();
