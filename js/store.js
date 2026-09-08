(function (window, document) {
  'use strict';

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function productCard(product, color) {
    var href = 'product.html?id=' + encodeURIComponent(product.id) + '&color=' + encodeURIComponent(color.id);
    return (
      '<article class="product-card">' +
      '<a class="thumb" href="' + href + '"><img src="' + color.images[0] + '" alt="' + product.name + ' in ' + color.name + '"></a>' +
      '<div>' +
      '<p class="muted" style="margin:0 0 4px;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;">' + product.tag + '</p>' +
      '<h3><a href="' + href + '">' + product.name + '</a></h3>' +
      '<p style="margin:6px 0 0;">' + color.name + ' · ' + window.CLUTCHPLAY.formatPeso(product.price) + '</p>' +
      '</div></article>'
    );
  }

  function renderHome() {
    var host = document.getElementById('featured-grid');
    if (!host) {
      return;
    }
    var cards = [];
    window.CLUTCHPLAY.PRODUCTS.forEach(function (product) {
      product.colors.forEach(function (color) {
        if (product.id === 'hoodie' || product.id === 'tee') {
          cards.push(productCard(product, color));
        }
      });
    });
    host.innerHTML = cards.join('');
  }

  function renderShop() {
    var host = document.getElementById('shop-grid');
    if (!host) {
      return;
    }
    var html = '';
    window.CLUTCHPLAY.PRODUCTS.forEach(function (product) {
      product.colors.forEach(function (color) {
        html += productCard(product, color);
      });
    });
    host.innerHTML = html;
  }

  function renderProduct() {
    var root = document.getElementById('product-root');
    if (!root) {
      return;
    }
    var product = window.CLUTCHPLAY.getProduct(qs('id') || 'tee');
    if (!product) {
      root.innerHTML = '<p>That piece is not in this drop.</p><p><a class="btn btn-primary" href="shop.html">Shop</a></p>';
      return;
    }
    var color = window.CLUTCHPLAY.getColor(product, qs('color'));
    var size = window.CLUTCHPLAY.SIZES[2];
    var qty = 1;
    var imageIndex = 0;

    function paint() {
      var images = color.images
        .map(function (src, index) {
          return (
            '<button type="button" data-image="' + index + '" aria-label="View photo ' + (index + 1) + '" aria-pressed="' + (index === imageIndex) + '">' +
            '<img src="' + src + '" alt="">' +
            '</button>'
          );
        })
        .join('');
      var swatches = product.colors
        .map(function (item) {
          return (
            '<button type="button" class="swatch" data-color="' + item.id + '" aria-label="' + item.name + '" aria-pressed="' + (item.id === color.id) + '" style="background:' + item.hex + '"></button>'
          );
        })
        .join('');
      var sizes = window.CLUTCHPLAY.SIZES.map(function (value) {
        return (
          '<button type="button" class="size-btn" data-size="' + value + '" aria-pressed="' + (value === size) + '">' + value + '</button>'
        );
      }).join('');

      root.innerHTML =
        '<div class="gallery">' +
        '<div class="gallery-main"><img id="main-photo" src="' + color.images[imageIndex] + '" alt="' + product.name + ' — ' + color.name + '"></div>' +
        (color.images.length > 1 ? '<div class="thumbs">' + images + '</div>' : '') +
        '</div>' +
        '<div class="product-info">' +
        '<p class="muted" style="letter-spacing:0.18em;text-transform:uppercase;font-size:0.75rem;">' + product.tag + '</p>' +
        '<h1 style="margin:8px 0 12px;">' + product.name + '</h1>' +
        (product.id === 'hoodie' ? '<p class="italic-mark" style="margin:0 0 12px;">CLUTCHPLAY™</p>' : '') +
        '<p class="price" style="font-size:1.25rem;">' + window.CLUTCHPLAY.formatPeso(product.price) + '</p>' +
        '<p class="price-note">Sample price — edit in js/products.js</p>' +
        '<p>' + product.details + '</p>' +
        '<p class="muted">' + color.ink + '</p>' +
        '<span class="field-label" id="color-label">Colour</span>' +
        '<div class="swatches" role="group" aria-labelledby="color-label">' + swatches + '</div>' +
        '<span class="field-label" id="size-label">Size</span>' +
        '<div class="sizes" role="group" aria-labelledby="size-label">' + sizes + '</div>' +
        '<span class="field-label" id="qty-label">Quantity</span>' +
        '<div class="qty" role="group" aria-labelledby="qty-label">' +
        '<button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>' +
        '<input id="qty-input" type="number" min="1" max="20" value="' + qty + '" aria-label="Quantity">' +
        '<button type="button" data-qty="1" aria-label="Increase quantity">+</button>' +
        '</div>' +
        '<div class="product-actions">' +
        '<button type="button" class="btn btn-primary btn-block" id="add-cart">Add to Cart</button>' +
        '<a class="btn btn-ghost btn-block" href="cart.html">View Cart</a>' +
        '</div></div>' +
        '<div class="sticky-cta"><span>' + window.CLUTCHPLAY.formatPeso(product.price) + '</span><button type="button" class="btn btn-primary" id="add-cart-mobile">Add to Cart</button></div>';

      document.title = product.name + ' — ClutchPlay';
      document.body.classList.toggle('product-cream', product.id === 'tee' && color.id === 'cream');
    }

    function currentQty() {
      var input = document.getElementById('qty-input');
      qty = Math.max(1, Math.min(20, parseInt(input && input.value, 10) || 1));
      if (input) {
        input.value = String(qty);
      }
      return qty;
    }

    function addToCart() {
      window.CLUTCHPLAY.Cart.add({
        productId: product.id,
        colorId: color.id,
        size: size,
        quantity: currentQty(),
      });
      window.CLUTCHPLAY.toast('Added to cart');
    }

    root.addEventListener('click', function (event) {
      var colorBtn = event.target.closest('[data-color]');
      var sizeBtn = event.target.closest('[data-size]');
      var qtyBtn = event.target.closest('[data-qty]');
      var imageBtn = event.target.closest('[data-image]');
      if (colorBtn) {
        color = window.CLUTCHPLAY.getColor(product, colorBtn.getAttribute('data-color'));
        imageIndex = 0;
        var url = new URL(window.location.href);
        url.searchParams.set('id', product.id);
        url.searchParams.set('color', color.id);
        window.history.replaceState({}, '', url);
        paint();
        return;
      }
      if (sizeBtn) {
        size = sizeBtn.getAttribute('data-size');
        paint();
        return;
      }
      if (qtyBtn) {
        var input = document.getElementById('qty-input');
        qty = Math.max(1, Math.min(20, (parseInt(input.value, 10) || 1) + Number(qtyBtn.getAttribute('data-qty'))));
        input.value = String(qty);
        return;
      }
      if (imageBtn) {
        imageIndex = Number(imageBtn.getAttribute('data-image'));
        paint();
        return;
      }
      if (event.target.id === 'add-cart' || event.target.id === 'add-cart-mobile') {
        addToCart();
      }
    });

    root.addEventListener('change', function (event) {
      if (event.target.id === 'qty-input') {
        currentQty();
      }
    });

    paint();
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHome();
    renderShop();
    renderProduct();
  });
})(window, document);
