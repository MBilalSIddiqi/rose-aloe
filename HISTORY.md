# Rose Aloe — Change History

Newest entries at the top.

---

### v1.1 — 2026-05-21
**Production values wired in; rebrand to Rose Aloe; deploy**

**Issue:** v1.0 left the site full of placeholders (`G-XXXXXXXXXX`, `rose-aloe.example.com`, `info@pureessencesoaps.com`) and still branded "Bint-e-Samin Soaps". Crawlers would follow the placeholder domain; visitors would email an unrelated address.

**Solution Implemented:**
1. **Brand rename** — global swap "Bint-e-Samin Soaps" → "Rose Aloe" across 23 HTML pages, monogram `BS` → `RA` in header/footer seals and `favicon.svg`, localStorage key `bint-e-samin-cart` → `rose-aloe-cart`.
2. **GA4 ID** — `G-XXXXXXXXXX` → `G-1NRXSBRQMY` in `ga.js` and the loader on every page.
3. **Production domain** — `rose-aloe.example.com` → `mbilalsiddiqi.github.io/rose-aloe` in `sitemap.xml` (21 entries), `robots.txt`, and JSON-LD on `index.html`.
4. **Support email** — `info@pureessencesoaps.com` → `bintesamin@gmail.com` on `contact.html`, `refund.html`, `term.html`, `privacy.html`.
5. **Deployment** — `git init` → public repo `MBilalSIddiqi/rose-aloe` → Pages enabled on `main`.
6. **Docs** — refreshed `CLAUDE.md` placeholder table to reflect live production values.

**Result:**
- Live at https://mbilalsiddiqi.github.io/rose-aloe/
- GA4 collecting realtime traffic
- Sitemap/JSON-LD point to the correct canonical URL
- Customer-facing email is functional

---

### v1.0 — 2026-05-21
**Production-readiness port from `glowbybs/` sibling site**

**Issue:** The `site/` redesign had stronger design and a cleaner code architecture than the deployed `glowbybs/` sibling, but was missing all production plumbing — no WhatsApp checkout, no SEO/OG/JSON-LD, no CSP, no sanitization, no favicons, no sitemap/robots, no refund policy, no skip link, no changelog.

**Solution Implemented:**
1. **WhatsApp checkout** — `checkoutWhatsApp()` builds a formatted `wa.me` URL from cart contents; wired to every cart drawer's checkout button via `[data-checkout-button]`. Contact form on `contact.html` submits to `wa.me` with sanitized inputs and email validation.
2. **XSS sanitization** — `escapeHTML()` and `sanitizeSearchInput()` helpers. Search-suggestion HTML now escapes product fields. Reviews also escaped defensively. Cart restore from `localStorage` reconciles items against `products-data.js`, dropping invalid or tampered entries.
3. **Content Security Policy** — strict CSP meta tag on every HTML page. `script-src` allows only same-origin + Google Tag Manager / Analytics. `connect-src` allows `wa.me`. Inline scripts blocked; GA logic moved to external `ga.js`.
4. **Accessibility** — Skip-to-content link as first child of `<body>` on every page (visually hidden until focus). `id="main-content"` on every `<main>`. "More" nav dropdown now has `aria-expanded`, click-to-toggle, click-outside / Escape to close. FAQ accordion already had proper ARIA.
5. **Favicon + theme-color** — `favicon.svg` in saffron + cream BS monogram on every page. `theme-color` meta for mobile browser chrome. `generate-favicons.html` ported and recolored for raster fallbacks (user can run to produce `apple-touch-icon.png`).
6. **SEO + JSON-LD + GA** — keywords, author, robots, full Open Graph + Twitter Card metadata on every page. `WebSite` + `Store` JSON-LD on `index.html`. `Product` JSON-LD injected at runtime by `product-page.js` per product page. GA snippet (placeholder ID `G-1NRXSBRQMY`) on every page via external `ga.js`.
7. **sitemap.xml + robots.txt** — full sitemap covering all 21 indexable pages with placeholder domain `https://mbilalsiddiqi.github.io/rose-aloe`. `robots.txt` allows all, disallows error pages, links to sitemap.
8. **Refund policy** — new `refund.html` with 7-day return window, eligibility rules, return process. Linked from every footer next to Privacy/Terms.
9. **Changelog** — this file and `CLAUDE.md` to enforce future change discipline.

**Files Modified:**
- `script.js` — added WhatsApp checkout, contact form handler, escapeHTML, sanitizeSearchInput, cart reconciliation, More dropdown wiring.
- `product-page.js` — appends Product JSON-LD to `<head>` at runtime.
- `styles.css` — `.skip-link` styles, `.contact-form-status` styles.
- `contact.html` — form gets `id="contact-form"`, required attrs, status node.
- All 23 HTML files — CSP meta, favicon link, theme-color, SEO meta, GA snippet, skip link, `id="main-content"` on `<main>`, ARIA on More dropdown, `[data-checkout-button]` on cart checkout, refund link in footer.
- `index.html` — WebSite + Store JSON-LD blocks.

**New Files:**
- `favicon.svg`
- `generate-favicons.html`
- `ga.js`
- `sitemap.xml`
- `robots.txt`
- `refund.html`
- `HISTORY.md`
- `CLAUDE.md`

**Result:**
- Cart can place real orders via WhatsApp.
- Search and reviews are XSS-safe; tampered carts are discarded on load.
- Strict CSP active site-wide; no inline scripts.
- Skip link + ARIA dropdown make keyboard nav usable.
- Tab favicons render; mobile browser chrome tints to `#b2603b`.
- Pages are share-link-previewable; per-product Product schema published.
- Crawlers can find every page via sitemap.
- Customers can read a real refund policy.

**Placeholders the operator must swap before deployment:**
- `https://mbilalsiddiqi.github.io/rose-aloe` → real production domain (sitemap.xml, robots.txt, JSON-LD on index.html).
- `G-1NRXSBRQMY` in `ga.js` → real GA4 measurement ID.
- `apple-touch-icon.png`, `favicon-32.png` → generate via `generate-favicons.html` then save into `site/`.
- Real product photography → add `image` field to entries in `products-data.js` (per-product JSON-LD will pick them up automatically).

---
