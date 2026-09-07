(function (window, document) {
  'use strict';

  function renderCart() {
    var root = document.getElementById('cart-root');
    if (!root) {
      return;
    }
    var lines = window.CLUTCHPLAY.Cart.getLines();
    if (!lines.length) {
      root.innerHTML =
        '<div class="empty-state">' +
        '<h1>Cart</h1>' +
        '<p class="muted">Your bag is empty.</p>' +
        '<p><a class="btn btn-primary" href="shop.html">Shop</a></p>' +
        '</div>';
      return;
    }

    var rows = lines
      .map(function (line) {
        return (
          '<article class="cart-line" data-key="' + line.key + '">' +
          '<img src="' + line.image + '" alt="">' +
          '<div class="cart-line-meta">' +
          '<div class="line-top"><h2 style="font-size:1rem;">' + line.name + '</h2><strong>' + window.CLUTCHPLAY.formatPeso(line.lineTotal) + '</strong></div>' +
          '<p class="muted" style="margin:0;">' + line.colorName + ' · ' + line.size + '</p>' +
          '<div class="qty">' +
          '<button type="button" data-action="dec" aria-label="Decrease quantity">−</button>' +
          '<input type="number" min="1" max="20" value="' + line.quantity + '" aria-label="Quantity for ' + line.name + '">' +
          '<button type="button" data-action="inc" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<button type="button" class="remove" data-action="remove">Remove</button>' +
          '</div></article>'
        );
      })
      .join('');

    root.innerHTML =
      '<div class="page-hero"><h1>Cart</h1></div>' +
      '<div class="section" style="padding-top:0;">' +
      '<div class="cart-list">' + rows + '</div>' +
      '<div class="cart-totals"><span>Subtotal</span><strong>' + window.CLUTCHPLAY.formatPeso(window.CLUTCHPLAY.Cart.subtotal()) + '</strong></div>' +
      '<a class="btn btn-primary btn-block" href="checkout.html">Checkout</a>' +
      '</div>';
  }

  document.addEventListener('click', function (event) {
    var line = event.target.closest('.cart-line');
    if (!line || !document.getElementById('cart-root')) {
      return;
    }
    var key = line.getAttribute('data-key');
    var input = line.querySelector('input');
    var action = event.target.getAttribute('data-action');
    if (action === 'remove') {
      window.CLUTCHPLAY.Cart.remove(key);
      renderCart();
      return;
    }
    if (action === 'inc' || action === 'dec') {
      var next = Number(input.value || 1) + (action === 'inc' ? 1 : -1);
      window.CLUTCHPLAY.Cart.updateQuantity(key, next);
      renderCart();
    }
  });

  document.addEventListener('change', function (event) {
    var line = event.target.closest('.cart-line');
    if (!line || event.target.type !== 'number') {
      return;
    }
    window.CLUTCHPLAY.Cart.updateQuantity(line.getAttribute('data-key'), event.target.value);
    renderCart();
  });

  window.addEventListener('clutchplay:cart', function () {
    if (document.getElementById('cart-root')) {
      renderCart();
    }
  });

  document.addEventListener('DOMContentLoaded', renderCart);
})(window, document);
