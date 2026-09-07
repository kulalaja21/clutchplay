(function (window, document) {
  'use strict';

  var MOBILE_RE = /^(09\d{9}|\+639\d{9}|639\d{9})$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(id, message) {
    var el = document.getElementById(id + '-error');
    var field = document.getElementById(id);
    if (el) {
      el.textContent = message || '';
    }
    if (field) {
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function renderSummary() {
    var host = document.getElementById('order-summary');
    if (!host) {
      return;
    }
    var lines = window.CLUTCHPLAY.Cart.getLines();
    if (!lines.length) {
      host.innerHTML = '<p>Your cart is empty.</p><a class="btn btn-primary" href="shop.html">Shop</a>';
      var submit = document.getElementById('place-order');
      if (submit) {
        submit.disabled = true;
      }
      return;
    }
    host.innerHTML =
      lines
        .map(function (line) {
          return (
            '<div class="cart-line">' +
            '<img src="' + line.image + '" alt="">' +
            '<div><strong>' + line.name + '</strong><p class="muted" style="margin:4px 0;">' + line.colorName + ' · ' + line.size + ' · Qty ' + line.quantity + '</p><p style="margin:0;">' + window.CLUTCHPLAY.formatPeso(line.lineTotal) + '</p></div>' +
            '</div>'
          );
        })
        .join('') +
      '<div class="cart-totals"><span>Subtotal</span><strong>' + window.CLUTCHPLAY.formatPeso(window.CLUTCHPLAY.Cart.subtotal()) + '</strong></div>' +
      '<p class="muted">Shipping computed on dispatch. Cash on Delivery available nationwide.</p>';
  }

  function validate() {
    var ok = true;
    var name = val('fullName');
    var street = val('street');
    var city = val('city');
    var province = val('province');
    var postal = val('postal');
    var mobile = val('mobile').replace(/\s+/g, '');
    var email = val('email');

    setError('fullName', name ? '' : 'Enter your full name.');
    setError('street', street ? '' : 'Enter your street address.');
    setError('city', city ? '' : 'Enter barangay / city.');
    setError('province', province ? '' : 'Enter province.');
    setError('postal', /^\d{4}$/.test(postal) ? '' : 'Enter a 4-digit postal code.');
    setError('mobile', MOBILE_RE.test(mobile) ? '' : 'Use 09XXXXXXXXX or +63 9XXXXXXXXX.');
    setError('email', EMAIL_RE.test(email) ? '' : 'Enter a valid email address.');

    if (!name || !street || !city || !province || !/^\d{4}$/.test(postal) || !MOBILE_RE.test(mobile) || !EMAIL_RE.test(email)) {
      ok = false;
    }
    if (!window.CLUTCHPLAY.Cart.getLines().length) {
      ok = false;
    }
    return ok;
  }

  function orderRef() {
    var n = Math.floor(1000 + Math.random() * 9000);
    return 'CP-' + n;
  }

  function buildMailto(order) {
    var lines = order.items
      .map(function (item) {
        return item.name + ' / ' + item.colorName + ' / ' + item.size + ' x' + item.quantity;
      })
      .join('\n');
    var body =
      'Order ' + order.id + '\n\n' +
      order.buyer.fullName + '\n' +
      order.buyer.street + '\n' +
      order.buyer.city + ', ' + order.buyer.province + ' ' + order.buyer.postal + '\n' +
      order.buyer.mobile + '\n' +
      order.buyer.email + '\n\n' +
      lines + '\n\nSubtotal: ' + window.CLUTCHPLAY.formatPeso(order.subtotal) + '\nPayment: ' + order.payment;
    return (
      'mailto:' +
      encodeURIComponent(window.CLUTCHPLAY.ORDER_EMAIL) +
      '?subject=' +
      encodeURIComponent('ClutchPlay order ' + order.id) +
      '&body=' +
      encodeURIComponent(body)
    );
  }

  function placeOrder(event) {
    event.preventDefault();
    if (!validate()) {
      var firstInvalid = document.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }
    var payment = (document.querySelector('input[name="payment"]:checked') || {}).value || 'cod';
    var order = {
      id: orderRef(),
      createdAt: new Date().toISOString(),
      payment: payment === 'gcash' ? 'GCash / bank transfer — details sent after order' : 'Cash on Delivery',
      subtotal: window.CLUTCHPLAY.Cart.subtotal(),
      buyer: {
        fullName: val('fullName'),
        street: val('street'),
        city: val('city'),
        province: val('province'),
        postal: val('postal'),
        mobile: val('mobile').replace(/\s+/g, ''),
        email: val('email'),
      },
      items: window.CLUTCHPLAY.Cart.getLines(),
    };
    window.CLUTCHPLAY.Cart.saveOrder(order);
    window.CLUTCHPLAY.Cart.clear();
    window.sessionStorage.setItem('clutchplay_mailto', buildMailto(order));
    window.location.href = 'confirmation.html';
  }

  function renderConfirmation() {
    var root = document.getElementById('confirm-root');
    if (!root) {
      return;
    }
    var order = window.CLUTCHPLAY.Cart.getLastOrder();
    if (!order) {
      root.innerHTML = '<div class="empty-state"><h1>No order yet</h1><p><a class="btn btn-primary" href="shop.html">Shop</a></p></div>';
      return;
    }
    var mailto = window.sessionStorage.getItem('clutchplay_mailto') || buildMailto(order);
    var items = order.items
      .map(function (item) {
        return '<li>' + item.name + ' — ' + item.colorName + ' / ' + item.size + ' × ' + item.quantity + ' (' + window.CLUTCHPLAY.formatPeso(item.lineTotal) + ')</li>';
      })
      .join('');
    root.innerHTML =
      '<div class="confirm-card">' +
      '<p class="muted">Order placed</p>' +
      '<h1>Salamat, ' + order.buyer.fullName.split(' ')[0] + '</h1>' +
      '<p>Reference <span class="order-ref">' + order.id + '</span></p>' +
      '<p>' + order.buyer.street + '<br>' + order.buyer.city + ', ' + order.buyer.province + ' ' + order.buyer.postal + '<br>' + order.buyer.mobile + '<br>' + order.buyer.email + '</p>' +
      '<ul>' + items + '</ul>' +
      '<p><strong>Subtotal ' + window.CLUTCHPLAY.formatPeso(order.subtotal) + '</strong><br>' + order.payment + '</p>' +
      '<div class="split-cta">' +
      '<a class="btn btn-primary" href="' + mailto + '">Email this order</a>' +
      '<a class="btn btn-ghost" href="shop.html">Continue shopping</a>' +
      '</div></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSummary();
    renderConfirmation();
    var form = document.getElementById('checkout-form');
    if (form) {
      form.addEventListener('submit', placeOrder);
    }
  });
})(window, document);
