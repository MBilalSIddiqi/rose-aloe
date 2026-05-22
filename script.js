const FREE_SHIPPING_THRESHOLD = 4500;
const CART_STORAGE_KEY = "rose-aloe-cart";
const WHATSAPP_PHONE_NUMBER = "923343601488";

const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];

function escapeHTML(value) {
  if (typeof value !== "string") {
    return "";
  }
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

function sanitizeSearchInput(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/<[^>]*>/g, "").substring(0, 100);
}

function isValidCartItem(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    item.price > 0 &&
    item.price <= 100000 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 99
  );
}

function reconcileCartItem(rawItem) {
  if (!isValidCartItem(rawItem)) {
    return null;
  }
  const product = products.find((entry) => entry.id === rawItem.id);
  if (!product) {
    return null;
  }
  return { ...product, quantity: rawItem.quantity };
}

let storedCart = [];
try {
  const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  if (Array.isArray(parsed)) {
    storedCart = parsed.map(reconcileCartItem).filter(Boolean);
  }
} catch (_err) {
  storedCart = [];
}
const cart = storedCart;

let activeFilter = "all";
let searchQuery = "";

const productGrid = document.querySelector("[data-product-grid]");
const resultsSummary = document.querySelector("[data-results-summary]");
const categoryGrids = Array.from(document.querySelectorAll("[data-category-grid]"));
const template = document.querySelector("#product-card-template");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartOverlay = document.querySelector("[data-cart-overlay]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const progressFill = document.querySelector("[data-progress-fill]");
const shippingMessage = document.querySelector("[data-shipping-message]");
const openCartButton = document.querySelector("[data-open-cart]");
const closeCartButton = document.querySelector("[data-close-cart]");
const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const mobileMenuLinks = Array.from(
  document.querySelectorAll("[data-mobile-menu] a"),
);
const newsletterForm = document.querySelector(".newsletter-form");
const searchInput = document.querySelector("[data-search-input]");
const searchSuggestions = document.querySelector("[data-search-suggestions]");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const faqTriggers = Array.from(document.querySelectorAll(".faq-trigger"));
const checkoutButtons = Array.from(document.querySelectorAll("[data-checkout-button]"));
const contactForm = document.querySelector("#contact-form");
let activeSuggestionIndex = -1;

const formatPrice = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("PKR", "Rs.");

const searchAliases = {
  serum: ["serum", "serums", "glow", "radiance", "brightening", "barrier"],
  shampoo: ["shampoo", "hair", "haircare", "wash", "repair", "rinse"],
  "face wash": ["face", "facewash", "face-wash", "cleanser", "wash", "cleanse"],
  soap: ["soap", "bar", "bars", "cleansing bar"],
  "oily skin": ["oily", "oil", "detox", "purifying", "clarifying", "charcoal", "tea tree"],
  skincare: ["skincare", "skin", "face", "glow", "hydration", "calming"],
  haircare: ["haircare", "hair", "shampoo", "repair", "lavender", "argan"],
};

const homeReviews = [
  {
    name: "Ayesha Khan",
    rating: 5,
    text:
      "The Lavender Silk Shampoo felt far more polished than I expected. The scent is soft, the bottle looks beautiful on the shelf, and it made my shower routine feel genuinely calmer.",
    date: "January 2026",
  },
  {
    name: "Sarah Ahmed",
    rating: 5,
    text:
      "The Charcoal Detox Bar gave my skin a cleaner-feeling rinse without the tightness I sometimes get from clarifying bars. Worth keeping in rotation.",
    date: "February 2026",
  },
  {
    name: "Mahnoor Ali",
    rating: 5,
    text:
      "The Rose and Saffron Serum has become part of my evening routine. It feels comforting, the glow is subtle, and the whole brand experience feels very refined.",
    date: "March 2026",
  },
];

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(query) {
  const baseTokens = normalizeText(query).split(" ").filter(Boolean);
  const expandedTokens = new Set(baseTokens);
  const normalizedQuery = normalizeText(query);

  Object.entries(searchAliases).forEach(([key, aliases]) => {
    const triggerTerms = [key, ...aliases].map(normalizeText);
    const shouldExpand =
      triggerTerms.some((term) => normalizedQuery.includes(term)) ||
      baseTokens.some((token) => triggerTerms.some((term) => term.includes(token)));

    if (shouldExpand) {
      triggerTerms.forEach((term) => {
        term.split(" ").forEach((piece) => {
          if (piece) {
            expandedTokens.add(piece);
          }
        });
      });
    }
  });

  return Array.from(expandedTokens);
}

function scoreProductForSearch(product, query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return 1;
  }

  const normalizedQuery = normalizeText(trimmedQuery);
  const tokens = getSearchTokens(trimmedQuery);
  const normalizedName = normalizeText(product.name);
  const normalizedTagline = normalizeText(product.tagline);
  const normalizedDescription = normalizeText(product.description);
  const normalizedCollection = normalizeText(product.collection || "");
  const normalizedNotes = product.notes.map(normalizeText);
  const normalizedCategory = product.category.map(normalizeText);

  let score = 0;

  if (normalizedName.includes(normalizedQuery)) {
    score += 120;
  }
  if (normalizedTagline.includes(normalizedQuery)) {
    score += 70;
  }
  if (normalizedCollection.includes(normalizedQuery)) {
    score += 60;
  }
  if (normalizedCategory.some((item) => item.includes(normalizedQuery))) {
    score += 55;
  }
  if (normalizedNotes.some((item) => item.includes(normalizedQuery))) {
    score += 45;
  }
  if (normalizedDescription.includes(normalizedQuery)) {
    score += 30;
  }

  tokens.forEach((token) => {
    if (normalizedName.includes(token)) {
      score += 35;
    }
    if (normalizedTagline.includes(token)) {
      score += 20;
    }
    if (normalizedCollection.includes(token)) {
      score += 20;
    }
    if (normalizedCategory.some((item) => item.includes(token))) {
      score += 18;
    }
    if (normalizedNotes.some((item) => item.includes(token))) {
      score += 16;
    }
    if (normalizedDescription.includes(token)) {
      score += 8;
    }
  });

  return score;
}

function getRankedProducts(query, filter = activeFilter) {
  return products
    .map((product) => ({
      product,
      score: scoreProductForSearch(product, query),
    }))
    .filter(({ product, score }) => {
      const matchesFilter = filter === "all" || product.category.includes(filter);
      const matchesSearch = query.trim() === "" || score > 0;
      return matchesFilter && matchesSearch;
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.product.name.localeCompare(right.product.name);
    });
}

function getVisibleProducts() {
  return getRankedProducts(searchQuery).map(({ product }) => product);
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function renderProducts() {
  if (!productGrid || !template) {
    return;
  }

  const visibleProducts = getVisibleProducts();
  const productLimit = Number(productGrid.dataset.productLimit || 0);
  const renderedProducts =
    productLimit > 0 ? visibleProducts.slice(0, productLimit) : visibleProducts;

  productGrid.innerHTML = "";

  renderedProducts.forEach((product) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const visual = node.querySelector(".product-visual");
    const notes = node.querySelector(".product-notes");
    const productLink = node.querySelector(".product-link");
    const titleLink = node.querySelector(".product-title-link");

    node.querySelector(".product-badge").textContent = product.badge;
    node.querySelector(".product-rating").textContent = `${product.rating} rating`;
    titleLink.textContent = product.name;
    node.querySelector(".product-tagline").textContent = product.tagline;
    node.querySelector(".product-price").textContent = formatPrice(product.price);
    node.querySelector(".product-size").textContent = product.size;

    product.notes.forEach((note) => {
      const tag = document.createElement("li");
      tag.textContent = note;
      notes.appendChild(tag);
    });

    applyProductCardVisual(visual, product);
    productLink.href = product.path;
    titleLink.href = product.path;

    node.querySelector("button").addEventListener("click", () => {
      addToCart(product.id);
      openCart();
    });

    productGrid.appendChild(node);
  });

  if (resultsSummary) {
    resultsSummary.textContent =
      renderedProducts.length > 0
        ? `Showing ${renderedProducts.length} product${renderedProducts.length === 1 ? "" : "s"} for your current view.`
        : "No products match this search yet. Try a different scent or category.";
  }
}

function closeSearchSuggestions() {
  if (!searchSuggestions || !searchInput) {
    return;
  }
  searchSuggestions.hidden = true;
  searchSuggestions.innerHTML = "";
  searchInput.setAttribute("aria-expanded", "false");
  activeSuggestionIndex = -1;
}

function renderSearchSuggestions() {
  if (!searchSuggestions || !searchInput) {
    return;
  }

  const trimmedQuery = searchQuery.trim();
  if (!trimmedQuery) {
    closeSearchSuggestions();
    return;
  }

  const matches = getRankedProducts(trimmedQuery, "all").slice(0, 5);
  if (matches.length === 0) {
    closeSearchSuggestions();
    return;
  }

  searchSuggestions.innerHTML = "";

  matches.forEach(({ product }, index) => {
    const item = document.createElement("a");
    item.className = "search-suggestion";
    item.href = product.path;
    item.innerHTML = `
      <strong>${escapeHTML(product.name)}</strong>
      <span>${escapeHTML(product.tagline)}</span>
      <small>${escapeHTML(product.collection)} - ${escapeHTML(formatPrice(product.price))}</small>
    `;

    item.addEventListener("mouseenter", () => {
      activeSuggestionIndex = index;
      updateSuggestionHighlight();
    });

    searchSuggestions.appendChild(item);
  });

  searchSuggestions.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
  activeSuggestionIndex = -1;
}

function updateSuggestionHighlight() {
  if (!searchSuggestions) {
    return;
  }

  const items = Array.from(searchSuggestions.querySelectorAll(".search-suggestion"));
  items.forEach((item, index) => {
    item.classList.toggle("is-active", index === activeSuggestionIndex);
  });
}

function renderCategorySections() {
  if (!template || categoryGrids.length === 0) {
    return;
  }

  categoryGrids.forEach((grid) => {
    const category = grid.dataset.categoryGrid;
    const matchingProducts = products
      .filter((product) => product.category.includes(category))
      .slice(0, 4);

    grid.innerHTML = "";

    matchingProducts.forEach((product) => {
      const node = template.content.firstElementChild.cloneNode(true);
      const visual = node.querySelector(".product-visual");
      const notes = node.querySelector(".product-notes");
      const productLink = node.querySelector(".product-link");
      const titleLink = node.querySelector(".product-title-link");

      node.querySelector(".product-badge").textContent = product.badge;
      node.querySelector(".product-rating").textContent = `${product.rating} rating`;
      titleLink.textContent = product.name;
      node.querySelector(".product-tagline").textContent = product.tagline;
      node.querySelector(".product-price").textContent = formatPrice(product.price);
      node.querySelector(".product-size").textContent = product.size;

      product.notes.forEach((note) => {
        const tag = document.createElement("li");
        tag.textContent = note;
        notes.appendChild(tag);
      });

      applyProductCardVisual(visual, product);
      productLink.href = product.path;
      titleLink.href = product.path;

      node.querySelector("button").addEventListener("click", () => {
        addToCart(product.id);
        openCart();
      });

      grid.appendChild(node);
    });
  });
}

function applyProductCardVisual(visual, product) {
  if (!visual) {
    return;
  }

  visual.style.background = product.color;
  visual.setAttribute("aria-label", `${product.name} showcase card`);
  visual.classList.remove("visual-bottle-card");

  const existingBottle = visual.querySelector(".product-card-bottle");
  if (existingBottle) {
    existingBottle.remove();
  }

  if (!product.category.includes("serum")) {
    return;
  }

  visual.classList.add("visual-bottle-card");

  const bottle = document.createElement("span");
  bottle.className = "product-card-bottle";
  bottle.innerHTML = `
    <span class="product-card-bottle-cap"></span>
    <span class="product-card-bottle-label">${product.name.replace(/\s+Serum$/i, "")}</span>
  `;

  visual.appendChild(bottle);
}

function renderStarRating(rating) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

function renderHomeReviews() {
  const reviewsGrid = document.getElementById("reviewsGrid");
  if (!reviewsGrid) {
    return;
  }

  reviewsGrid.innerHTML = "";

  homeReviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("role", "listitem");
    card.innerHTML = `
      <div class="review-stars" aria-label="${escapeHTML(String(review.rating))} out of 5 stars">${renderStarRating(review.rating)}</div>
      <p class="review-text">"${escapeHTML(review.text)}"</p>
      <div class="review-footer">
        <strong class="review-author">${escapeHTML(review.name)}</strong>
        <span class="review-date">${escapeHTML(review.date)}</span>
      </div>
    `;

    reviewsGrid.appendChild(card);
  });
}

function addToCart(productId) {
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    const product = products.find((item) => item.id === productId);
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) {
    return;
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.id === productId);
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function updateShippingProgress(totalPrice) {
  if (!progressFill || !shippingMessage) {
    return;
  }

  const progress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  progressFill.style.width = `${progress}%`;

  if (totalPrice === 0) {
    shippingMessage.textContent = "Add items worth Rs. 4,500 for free delivery.";
    return;
  }

  if (totalPrice >= FREE_SHIPPING_THRESHOLD) {
    shippingMessage.textContent = "You unlocked free delivery across Pakistan.";
    return;
  }

  shippingMessage.textContent = `${formatPrice(
    FREE_SHIPPING_THRESHOLD - totalPrice,
  )} away from free delivery.`;
}

function renderCart() {
  if (!cartItems || !cartCount || !cartTotal || !cartSubtotal) {
    return;
  }

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "cart-empty";
    emptyState.textContent =
      "Your basket is empty. Add a handcrafted bar, serum, or shampoo to start building your order.";
    cartItems.appendChild(emptyState);
  } else {
    cart.forEach((item) => {
      const line = document.createElement("article");
      line.className = "cart-line";
      line.innerHTML = `
        <div class="cart-line-meta">
          <p>${item.name}</p>
          <span>${item.size}</span>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </div>
        <div class="cart-quantity" aria-label="Quantity controls for ${item.name}">
          <button type="button" aria-label="Decrease quantity of ${item.name}">-</button>
          <span>${item.quantity}</span>
          <button type="button" aria-label="Increase quantity of ${item.name}">+</button>
        </div>
      `;

      const buttons = line.querySelectorAll("button");
      buttons[0].addEventListener("click", () => changeQuantity(item.id, -1));
      buttons[1].addEventListener("click", () => changeQuantity(item.id, 1));
      cartItems.appendChild(line);
    });
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatPrice(totalPrice);
  cartSubtotal.textContent = formatPrice(totalPrice);
  updateShippingProgress(totalPrice);
}

function openCart() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }
  closeMobileMenu();
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartOverlay.hidden = false;
}

function closeCart() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartOverlay.hidden = true;
}

function openMobileMenu() {
  if (!mobileMenu || !mobileMenuToggle) {
    return;
  }
  closeCart();
  mobileMenu.hidden = false;
  mobileMenu.classList.add("is-open");
  mobileMenuToggle.setAttribute("aria-expanded", "true");
  mobileMenuToggle.setAttribute("aria-label", "Close menu");
}

function closeMobileMenu() {
  if (!mobileMenu || !mobileMenuToggle) {
    return;
  }
  mobileMenu.classList.remove("is-open");
  mobileMenu.hidden = true;
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-label", "Open menu");
}

function toggleMobileMenu() {
  if (!mobileMenu || !mobileMenuToggle) {
    return;
  }

  if (mobileMenu.hidden) {
    openMobileMenu();
    return;
  }

  closeMobileMenu();
}

if (openCartButton) {
  openCartButton.addEventListener("click", openCart);
}

if (closeCartButton) {
  closeCartButton.addEventListener("click", closeCart);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", toggleMobileMenu);
}

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = newsletterForm.querySelector("input");
    const button = newsletterForm.querySelector("button");
    button.textContent = "Member access unlocked";
    input.value = "";
  });
}

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    searchQuery = sanitizeSearchInput(event.target.value);
    renderProducts();
    renderSearchSuggestions();
  });

  searchInput.addEventListener("focus", () => {
    renderSearchSuggestions();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (!searchSuggestions || searchSuggestions.hidden) {
      return;
    }

    const items = Array.from(searchSuggestions.querySelectorAll(".search-suggestion"));
    if (items.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
      updateSuggestionHighlight();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeSuggestionIndex =
        activeSuggestionIndex <= 0 ? items.length - 1 : activeSuggestionIndex - 1;
      updateSuggestionHighlight();
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();
      items[activeSuggestionIndex].click();
      return;
    }

    if (event.key === "Escape") {
      closeSearchSuggestions();
    }
  });
}

document.addEventListener("click", (event) => {
  if (
    searchSuggestions &&
    searchInput &&
    !searchSuggestions.contains(event.target) &&
    event.target !== searchInput
  ) {
    closeSearchSuggestions();
  }

  if (
    mobileMenu &&
    mobileMenuToggle &&
    !mobileMenu.hidden &&
    !mobileMenu.contains(event.target) &&
    !mobileMenuToggle.contains(event.target)
  ) {
    closeMobileMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
    closeCart();
    closeSearchSuggestions();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((entry) => entry.classList.remove("is-active"));
    button.classList.add("is-active");
    renderProducts();
  });
});

faqTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".faq-item");
    const accordion = trigger.closest(".faq-accordion");
    const panel = trigger.nextElementSibling;
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    const symbol = trigger.querySelector(".faq-symbol");

    if (accordion) {
      accordion.querySelectorAll(".faq-item").forEach((entry) => {
        if (entry === item) {
          return;
        }

        const entryTrigger = entry.querySelector(".faq-trigger");
        const entryPanel = entry.querySelector(".faq-panel");
        const entrySymbol = entry.querySelector(".faq-symbol");

        entry.classList.remove("is-active");

        if (entryTrigger) {
          entryTrigger.setAttribute("aria-expanded", "false");
        }

        if (entryPanel) {
          entryPanel.hidden = true;
          entryPanel.setAttribute("aria-hidden", "true");
        }

        if (entrySymbol) {
          entrySymbol.textContent = "+";
        }
      });
    }

    trigger.setAttribute("aria-expanded", String(!isExpanded));

    if (panel) {
      panel.hidden = isExpanded;
      panel.setAttribute("aria-hidden", String(isExpanded));
    }

    if (item) {
      item.classList.toggle("is-active", !isExpanded);
    }

    if (symbol) {
      symbol.textContent = isExpanded ? "+" : "−";
    }
  });
});

function buildCartWhatsAppMessage() {
  const lines = [
    "New order from Rose Aloe",
    "",
    "Order details:",
    "------------------------",
  ];

  cart.forEach((item) => {
    lines.push("");
    lines.push(item.name);
    lines.push(`  Size: ${item.size}`);
    lines.push(`  Qty: ${item.quantity}`);
    lines.push(`  Unit: ${formatPrice(item.price)}`);
    lines.push(`  Subtotal: ${formatPrice(item.price * item.quantity)}`);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  lines.push("");
  lines.push("------------------------");
  lines.push(`Total: ${formatPrice(total)}`);
  lines.push("");
  lines.push("Please confirm this order and share delivery details.");

  return lines.join("\n");
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    if (shippingMessage) {
      shippingMessage.textContent = "Add at least one item before checking out.";
    }
    return;
  }

  const message = buildCartWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

checkoutButtons.forEach((button) => {
  button.addEventListener("click", checkoutWhatsApp);
});

const navMoreTriggers = Array.from(document.querySelectorAll("[data-nav-more-trigger]"));
navMoreTriggers.forEach((trigger) => {
  const wrapper = trigger.closest(".site-nav-more");
  if (!wrapper) {
    return;
  }
  const close = () => {
    wrapper.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    wrapper.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  };
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    if (expanded) {
      close();
    } else {
      open();
    }
  });
  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });
});

function sanitizeContactInput(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/<[^>]*>/g, "").trim();
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = sanitizeContactInput(contactForm.elements.name?.value);
    const email = sanitizeContactInput(contactForm.elements.email?.value);
    const phone = sanitizeContactInput(contactForm.elements.phone?.value);
    const subject = sanitizeContactInput(contactForm.elements.subject?.value);
    const message = sanitizeContactInput(contactForm.elements.message?.value);

    const statusNode = contactForm.querySelector("[data-contact-status]");
    const setStatus = (text, isError = false) => {
      if (statusNode) {
        statusNode.textContent = text;
        statusNode.classList.toggle("is-error", isError);
      }
    };

    if (!name || !email || !subject || !message) {
      setStatus("Please fill in name, email, subject, and message.", true);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setStatus("Please enter a valid email address.", true);
      return;
    }

    const lines = [
      "Contact form submission",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
    ];
    if (phone) {
      lines.push(`Phone: ${phone}`);
    }
    lines.push(`Subject: ${subject}`);
    lines.push("");
    lines.push("Message:");
    lines.push(message);
    lines.push("");
    lines.push("Sent from Rose Aloe website");

    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");

    setStatus("Opening WhatsApp to send your message. Thank you.");
    contactForm.reset();
  });
}

renderProducts();
renderCategorySections();
renderHomeReviews();
renderCart();
