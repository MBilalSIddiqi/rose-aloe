# Rose Aloe — Change History

Newest entries at the top.

---

### v1.4 — 2026-06-04
**Replace mobile "Menu" text with hamburger icon**

**Issue:** The mobile header toggle showed an icon plus the word "Menu". Requested a cleaner three-equal-lines (hamburger) icon with no text.

**Solution Implemented:**
1. Hid the `.mobile-menu-toggle-label` ("Menu") text at ≤720px.
2. Rebuilt the `::before` icon as three equal full-width lines (top + bottom borders plus a centered 2px gradient line); made the button a compact 2.85rem circle.
3. The open state still morphs into an X. The button keeps its existing `aria-label="Open menu"`, so removing the visible text doesn't affect screen readers.

**Files Modified:**
- `styles.css` — `@media (max-width: 720px)` `.mobile-menu-toggle` rules

**Result:**
- Compact hamburger (three equal lines) replaces the "Menu" label on mobile; shared header markup, so all pages benefit.

---

### v1.3 — 2026-06-04
**Fix overlapping header text on mobile**

**Issue:** On phones the header brand block overlapped the Menu/Cart buttons. The brand lockup carried a two-line stack — the long "Handcrafted Botanical Care" eyebrow plus the "Rose Aloe" name — and the eyebrow wrapped and collided with the right-side actions in the narrow `minmax(0, 1fr) auto` header grid.

**Solution Implemented:**
1. Hid the decorative `.eyebrow` tagline at ≤720px (kept on tablet/desktop), leaving a clean single-line brand name.
2. Set `.brand-name { white-space: nowrap }` so it never wraps into the actions.
3. Re-centered `.brand-mark` vertically (`align-items: center`) and tightened its gap now that the lockup is one line; removed the now-unneeded lockup top padding.

**Files Modified:**
- `styles.css` — `@media (max-width: 720px)` brand/header rules

**Result:**
- No header overlap on phones; seal + "Rose Aloe" sit on one line with Menu/Cart cleanly to the right.
- Site-wide (shared header markup), so all pages benefit.

---

### v1.2 — 2026-06-04
**Fix mobile horizontal overflow (page rendered zoomed-out)**

**Issue:** On phones the whole page rendered shrunk-to-fit (tiny text, "unresponsive" look) even though the mobile breakpoints exist. Cause: the decorative `.ambient-orb` elements are `position: fixed; width: 22rem` pulled partly off-screen (`orb-left { left: -10rem }`, `orb-right { right: -8rem }`). Fixed-position elements are clipped by the viewport/`<html>`, not `body`, so the existing `body { overflow-x: hidden }` never caught them — the orbs overhung the right edge, creating horizontal overflow and forcing mobile browsers to zoom the page out.

**Solution Implemented:**
1. Added `overflow-x: hidden` to the `html` rule so the off-screen fixed orbs are clipped to the viewport.

**Files Modified:**
- `styles.css` — `html { ... }` now also sets `overflow-x: hidden`

**Result:**
- No horizontal overflow on phones; the page renders at correct scale and the existing mobile breakpoints apply as intended.
- Site-wide fix (orbs + body-only clip were global), so all pages benefit.

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
