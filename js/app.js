(function (window, document) {
  'use strict';

  function svgBag() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M7 7V6a5 5 0 0 1 10 0v1h3v14H4V7h3zm2 0h6V6a3 3 0 0 0-6 0v1z"/>' +
      '</svg>'
    );
  }

  function currentPage() {
    var file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!file || file === '') {
      return 'index.html';
    }
    return file;
  }

  function navLink(href, label) {
    var page = currentPage();
    var active = page === href || (href === 'index.html' && page === '');
    return (
      '<a href="' +
      href +
      '"' +
      (active ? ' aria-current="page"' : '') +
      '>' +
      label +
      '</a>'
    );
  }

  function lockHeaderLogoSize() {
    if (document.getElementById('header-logo-lock')) {
      return;
    }
    var style = document.createElement('style');
    style.id = 'header-logo-lock';
    style.textContent =
      '.header-inner{display:flex!important;align-items:center!important}' +
      '.wordmark{flex:0 0 auto!important;width:auto!important}' +
      '.wordmark img{height:15px!important;width:auto!important;max-height:15px!important;max-width:150px!important}';
    document.head.appendChild(style);
  }

  function renderChrome() {
    lockHeaderLogoSize();
    var headerHost = document.getElementById('site-header');
    var footerHost = document.getElementById('site-footer');
    if (headerHost) {
      headerHost.innerHTML =
        '<div class="header-inner">' +
        '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">' +
        '<span></span><span></span><span></span>' +
        '</button>' +
        '<a class="wordmark" href="index.html" aria-label="ClutchPlay home">' +
        '<img src="images/home-button.png?v=10" alt="CLUTCHPLAY" width="140" height="15" style="height:15px;width:auto;max-height:15px;max-width:150px;display:block;">' +
        '</a>' +
        '<nav id="site-nav" class="site-nav">' +
        navLink('shop.html', 'Shop') +
        navLink('about.html', 'About') +
        navLink('contact.html', 'Contact') +
        '<a class="nav-email" href="mailto:wemakehustleplay@gmail.com">wemakehustleplay@gmail.com</a>' +
        '</nav>' +
        '<a class="cart-link" href="cart.html" aria-label="Cart">' +
        svgBag() +
        '<span class="cart-badge" hidden>0</span>' +
        '</a>' +
        '</div>' +
        '<div class="nav-drawer" hidden>' +
        navLink('shop.html', 'Shop') +
        navLink('about.html', 'About') +
        navLink('contact.html', 'Contact') +
        '<a class="nav-email" href="mailto:wemakehustleplay@gmail.com">wemakehustleplay@gmail.com</a>' +
        '<a href="https://www.facebook.com/TheCLutchPlayPh" target="_blank" rel="noopener noreferrer">Follow us on Facebook</a>' +
        '</div>';
    }

    if (footerHost) {
      footerHost.innerHTML =
        '<div class="footer-inner">' +
        '<div class="footer-brand">' +
        '<p class="script">ClutchPlay</p>' +
        '<p class="muted">Philippine streetwear. Heavy cotton. Oversized fit.</p>' +
        '</div>' +
        '<div class="footer-links">' +
        '<a href="shop.html">Shop</a>' +
        '<a href="about.html">About</a>' +
        '<a href="contact.html">Contact</a>' +
        '<a href="https://www.facebook.com/TheCLutchPlayPh" target="_blank" rel="noopener noreferrer">Follow us on Facebook</a>' +
        '<a href="mailto:wemakehustleplay@gmail.com">wemakehustleplay@gmail.com</a>' +
        '<a href="tel:+639669900622">0966-990-0622</a>' +
        '</div>' +
        '<p class="fineprint">Nationwide shipping. Metro Manila 2–4 days. Provincial 5–10 days. Cash on Delivery available.</p>' +
        '</div>';
    }
  }

  function updateCartBadge() {
    var count = window.CLUTCHPLAY.Cart.count();
    document.querySelectorAll('.cart-badge').forEach(function (badge) {
      if (count > 0) {
        badge.hidden = false;
        badge.textContent = String(count);
      } else {
        badge.hidden = true;
      }
    });
    var cartLink = document.querySelector('.cart-link');
    if (cartLink) {
      cartLink.setAttribute('aria-label', count ? 'Cart, ' + count + ' items' : 'Cart');
    }
  }

  function bindNav() {
    var toggle = document.querySelector('.nav-toggle');
    var drawer = document.querySelector('.nav-drawer');
    if (!toggle || !drawer) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      drawer.hidden = open;
      document.body.classList.toggle('nav-open', !open);
    });
  }

  function toast(message) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(function () {
      el.classList.remove('is-visible');
    }, 2200);
  }

  window.CLUTCHPLAY.toast = toast;
  window.CLUTCHPLAY.updateCartBadge = updateCartBadge;

  document.addEventListener('DOMContentLoaded', function () {
    renderChrome();
    bindNav();
    updateCartBadge();
  });

  window.addEventListener('clutchplay:cart', updateCartBadge);
})(window, document);
