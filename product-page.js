const productSlug = document.body.dataset.productSlug;
const productData = Array.isArray(window.PRODUCTS)
  ? window.PRODUCTS.find((item) => item.id === productSlug)
  : null;

if (productData) {
  document.title = `${productData.name} | Rose Aloe`;

  const fillText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) {
      node.textContent = value;
    }
  };

  fillText("[data-product-badge]", productData.badge);
  fillText("[data-product-name]", productData.name);
  fillText("[data-product-tagline]", productData.tagline);
  fillText("[data-product-description]", productData.longDescription);
  fillText("[data-product-price]", new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(productData.price).replace("PKR", "Rs."));
  fillText("[data-product-rating]", `${productData.rating} rating`);
  fillText("[data-product-size]", productData.size);
  fillText("[data-product-collection]", productData.collection);
  fillText("[data-product-ritual]", productData.ritual);

  const visual = document.querySelector("[data-product-visual]");
  if (visual) {
    visual.style.background = productData.color;
  }

  const bottle = document.querySelector("[data-product-bottle]");
  if (bottle) {
    bottle.setAttribute("data-label", productData.name);

    if (productData.size.toLowerCase().includes("bar")) {
      bottle.classList.add("is-soap");
      bottle.style.background = productData.color;
      if (visual) {
        visual.classList.add("visual-soap");
      }
    } else if (visual) {
      visual.classList.add("visual-bottle");
      if (productData.category.includes("serum")) {
        bottle.classList.add("is-serum");
        bottle.innerHTML =
          `<span class="product-card-bottle-cap"></span><span class="product-card-bottle-label">${productData.name.replace(/\s+Serum$/i, "")}</span>`;
        bottle.setAttribute(
          "data-label",
          productData.name.replace(/\s+Serum$/i, ""),
        );
      }
      if (
        productData.category.includes("serum") ||
        productData.category.includes("haircare") ||
        productData.name.toLowerCase().includes("face wash") ||
        productData.size.toLowerCase().includes("set")
      ) {
        visual.classList.add("visual-bottle-minimal");
      }
    }
  }

  const benefitsList = document.querySelector("[data-product-benefits]");
  const ingredientsList = document.querySelector("[data-product-ingredients]");

  if (benefitsList) {
    benefitsList.innerHTML = "";
    productData.benefits.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      benefitsList.appendChild(li);
    });
  }

  if (ingredientsList) {
    ingredientsList.innerHTML = "";
    productData.ingredients.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ingredientsList.appendChild(li);
    });
  }

  const addButton = document.querySelector("[data-add-product]");
  if (addButton && typeof addToCart === "function") {
    addButton.addEventListener("click", () => {
      addToCart(productData.id);
      if (typeof openCart === "function") {
        openCart();
      }
    });
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.name,
    description: productData.longDescription || productData.description,
    sku: productData.id,
    brand: { "@type": "Brand", name: "Rose Aloe" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: productData.price,
      availability: "https://schema.org/InStock",
    },
  };
  if (productData.image) {
    productSchema.image = productData.image;
  }
  if (productData.rating) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: productData.rating,
      reviewCount: 1,
    };
  }
  const schemaNode = document.createElement("script");
  schemaNode.type = "application/ld+json";
  schemaNode.textContent = JSON.stringify(productSchema);
  document.head.appendChild(schemaNode);
}
