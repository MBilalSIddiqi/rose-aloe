# Rose Aloe

A static multi-page storefront for Rose Aloe, built around a warm botanical luxury aesthetic with dedicated product pages, category browsing, customer reviews, and lightweight cart behavior.

## What's Included

- Homepage with a cinematic hero, category sections, and customer reviews
- Shop page with search, live suggestions, and category filters
- About, Contact, and FAQ pages
- Dedicated product pages for soaps, serums, shampoos, face wash, and gift sets
- Privacy policy and terms pages
- Error pages: `404.html`, `500.html`, and `error.html`
- Persistent cart using `localStorage`

## Main Files

- `index.html` - homepage
- `shop.html` - catalog page
- `about.html` - brand story
- `contact.html` - contact page
- `faq.html` - grouped FAQ page
- `privacy.html` - privacy policy
- `term.html` - terms and conditions
- `404.html`, `500.html`, `error.html` - error pages
- `styles.css` - shared styling
- `script.js` - cart, catalog, search, FAQ, and review behavior
- `products-data.js` - shared product catalog data
- `product-page.js` - individual product-page rendering logic

## Product Pages

Each product has its own HTML page, for example:

- `rose-saffron.html`
- `lavender-silk.html`
- `neem-garden.html`
- `signature-box.html`

## How to Preview

Open `index.html` in a browser, or open any of the other HTML files directly.

## Notes

- The site is static and does not require a server to view.
- The checkout flow is still a demo-style storefront interaction.
- Cart contents are stored in the browser with `localStorage`.

## Recommended Next Steps

- Connect the cart to a real checkout or order flow
- Add real product photography
- Add filtered links for the `More` navigation dropdown
- Add better SEO metadata across all pages
- Add browser-level testing for responsive layouts
