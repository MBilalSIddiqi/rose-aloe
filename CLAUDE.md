# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rose Aloe** — a static multi-page storefront for handcrafted botanical soaps, serums, shampoos, face wash, and gift sets. Pure HTML/CSS/JS with no build step. Cart persists in `localStorage`; checkout is WhatsApp-based via `wa.me`.

## File Structure

```
site/
├── index.html              # Homepage
├── shop.html               # Catalog with search, filters, ranked suggestions
├── about.html              # Brand story
├── contact.html            # Contact (form submits to WhatsApp)
├── faq.html                # Grouped accordion FAQ
├── privacy.html            # Privacy policy
├── term.html               # Terms & conditions
├── refund.html             # Refund policy (7-day window)
├── 404.html / 500.html / error.html  # Error pages with full chrome
├── <slug>.html             # 13 product pages, each with `data-product-slug`
├── styles.css              # All styling
├── script.js               # Cart, search, FAQ, cart→WhatsApp, contact→WhatsApp
├── products-data.js        # Product catalog (window.PRODUCTS)
├── product-page.js         # Per-product page rendering + Product JSON-LD
├── ga.js                   # GA4 init (CSP-safe external script)
├── favicon.svg             # Tab icon
├── generate-favicons.html  # Raster favicon generator (run in browser)
├── sitemap.xml             # Crawler sitemap
├── robots.txt              # Crawler directives
├── HISTORY.md              # Change log (MANDATORY to update)
└── README.md, improvements.txt
```

## Conventions

### HTML
- Semantic elements (`<header>`, `<nav>`, `<main id="main-content">`, `<footer>`).
- Skip-to-content link as first child of `<body>` on every page.
- CSP meta tag immediately after `<meta name="viewport">`.
- Favicon + theme-color after `<link rel="stylesheet">`.
- SEO meta block (keywords, author, robots, OG, Twitter, GA) directly after theme-color.
- No inline `onclick` — use `addEventListener` only (CSP blocks inline scripts).

### CSS
- Color tokens are CSS custom properties in `:root` (`--accent #b2603b`, `--sage #70806a`, `--bg #f6efe5`, etc.). Always use the tokens, never hex values.
- Existing `:focus-visible` covers buttons / inputs / links; add per-component focus rings using `var(--accent)`.

### JavaScript
- All event handlers via `addEventListener`. No inline handlers.
- User input must be sanitized: `sanitizeSearchInput()` for search, `escapeHTML()` before injecting into `innerHTML`.
- Cart items restored from `localStorage` must be reconciled against `window.PRODUCTS` (see `reconcileCartItem` in `script.js`).
- `WHATSAPP_PHONE_NUMBER` constant in `script.js` is the single source of truth.

### File Paths
- All paths are relative (e.g. `styles.css`, not `/styles.css`) so the site works on any subpath.

## Brand

- **Tone:** botanical, warm, refined; gentle and trustworthy.
- **Palette:** cream `#f6efe5`, saffron `#b2603b`, deep saffron `#8f4427`, sage `#70806a`, gold `#d3af6a`.
- **Typography:** Cormorant Garamond (display serif) + Manrope (sans).
- **Voice:** handcrafted, small-batch, gift-friendly, no over-claims.

## Mandatory: Documenting Changes

Every functional change MUST add an entry to the **top** of `HISTORY.md`. Template:

```markdown
### vX.Y — YYYY-MM-DD
**Short title**

**Issue:** What problem or request prompted this.

**Solution Implemented:**
1. ...
2. ...

**Files Modified:**
- file — what changed

**Result:**
- outcome 1
- outcome 2
```

## Placeholders Used in the Codebase

These were left as placeholders during the production-readiness port. Replace before deployment:

| Placeholder | Where | Replace with |
|---|---|---|
| `https://rose-aloe.example.com` | `sitemap.xml`, `robots.txt`, JSON-LD on `index.html` | Real production domain |
| `G-1NRXSBRQMY` | `ga.js` | Real GA4 measurement ID |
| `+92 334 3601488` | `script.js` (`WHATSAPP_PHONE_NUMBER`), various contact pages | Real WhatsApp number, if different |
| `info@pureessencesoaps.com` | `contact.html`, `refund.html` | Real support email |

## Quick Commands

| Task | Command |
|---|---|
| Serve locally | `python3 -m http.server 8000` (run from `site/`) |
| Syntax-check JS | `node --check script.js` |
| List all pages for the sitemap | `ls *.html` |

## Accessibility Floor

Every change should preserve:
- Skip link as first body child.
- `id="main-content"` on `<main>`.
- `aria-expanded` state on toggles (More dropdown, FAQ accordion, mobile menu).
- Keyboard reachability: every interactive element is a real `<button>` or `<a>`.
- Color contrast WCAG AA.

## Notes

- Cart contents live in `localStorage` under `rose-aloe-cart`.
- Cart reconciles against `window.PRODUCTS` on load; tampered or stale items are dropped silently.
- Per-product `Product` JSON-LD is generated at runtime in `product-page.js` from the matching `products-data.js` entry — no per-page HTML edits required.
