(function (window) {
  'use strict';

  var STORAGE_CART = 'clutchplay_cart';
  var STORAGE_ORDERS = 'clutchplay_orders';
  var STORAGE_LAST_ORDER = 'clutchplay_last_order';

  function readJson(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function lineKey(item) {
    return [item.productId, item.colorId, item.size].join('::');
  }

  function hydrate(item) {
    var product = window.CLUTCHPLAY.getProduct(item.productId);
    if (!product) {
      return null;
    }
    var color = window.CLUTCHPLAY.getColor(product, item.colorId);
    return {
      key: lineKey(item),
      productId: product.id,
      name: product.name,
      price: product.price,
      colorId: color.id,
      colorName: color.name,
      size: item.size,
      quantity: item.quantity,
      image: color.images[0],
      lineTotal: product.price * item.quantity,
    };
  }

  window.CLUTCHPLAY.Cart = {
    getItems: function () {
      return readJson(STORAGE_CART, []);
    },

    setItems: function (items) {
      writeJson(STORAGE_CART, items);
      window.dispatchEvent(new CustomEvent('clutchplay:cart'));
    },

    count: function () {
      return this.getItems().reduce(function (sum, item) {
        return sum + Number(item.quantity || 0);
      }, 0);
    },

    add: function (payload) {
      var quantity = Math.max(1, parseInt(payload.quantity, 10) || 1);
      var incoming = {
        productId: payload.productId,
        colorId: payload.colorId,
        size: payload.size,
        quantity: quantity,
      };
      var items = this.getItems();
      var key = lineKey(incoming);
      var found = items.find(function (item) {
        return lineKey(item) === key;
      });
      if (found) {
        found.quantity += quantity;
      } else {
        items.push(incoming);
      }
      this.setItems(items);
    },

    updateQuantity: function (key, quantity) {
      var next = Math.max(1, parseInt(quantity, 10) || 1);
      var items = this.getItems()
        .map(function (item) {
          if (lineKey(item) === key) {
            item.quantity = next;
          }
          return item;
        });
      this.setItems(items);
    },

    remove: function (key) {
      var items = this.getItems().filter(function (item) {
        return lineKey(item) !== key;
      });
      this.setItems(items);
    },

    clear: function () {
      this.setItems([]);
    },

    getLines: function () {
      return this.getItems()
        .map(hydrate)
        .filter(Boolean);
    },

    subtotal: function () {
      return this.getLines().reduce(function (sum, line) {
        return sum + line.lineTotal;
      }, 0);
    },

    saveOrder: function (order) {
      var orders = readJson(STORAGE_ORDERS, []);
      orders.unshift(order);
      writeJson(STORAGE_ORDERS, orders);
      writeJson(STORAGE_LAST_ORDER, order);
    },

    getLastOrder: function () {
      return readJson(STORAGE_LAST_ORDER, null);
    },
  };
})(window);
