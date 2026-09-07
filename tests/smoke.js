/**
 * Headless smoke checks for cart + checkout validation.
 * Run: node tests/smoke.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');

function load(file, sandbox) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
}

const store = {};
const sandbox = {
  window: {},
  CustomEvent: class CustomEvent {
    constructor(name) {
      this.type = name;
    }
  },
};
sandbox.window = sandbox;
sandbox.window.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    store[k] = String(v);
  },
};
sandbox.window.dispatchEvent = () => {};

load('js/products.js', sandbox);
load('js/cart.js', sandbox);

const { Cart, formatPeso, getProduct } = sandbox.window.CLUTCHPLAY;

assert.strictEqual(getProduct('tee').price, 799);
assert.strictEqual(getProduct('hoodie').price, 1499);
assert.ok(formatPeso(1499).includes('1,499') || formatPeso(1499).includes('1499'));

Cart.add({ productId: 'tee', colorId: 'cream', size: 'L', quantity: 2 });
Cart.add({ productId: 'tee', colorId: 'cream', size: 'L', quantity: 1 });
assert.strictEqual(Cart.count(), 3);
assert.strictEqual(Cart.subtotal(), 799 * 3);

Cart.add({ productId: 'hoodie', colorId: 'black', size: 'M', quantity: 1 });
assert.strictEqual(Cart.count(), 4);

const hoodieLine = Cart.getLines().find((l) => l.productId === 'hoodie');
Cart.updateQuantity(hoodieLine.key, 2);
assert.strictEqual(Cart.subtotal(), 799 * 3 + 1499 * 2);

Cart.remove(hoodieLine.key);
assert.strictEqual(Cart.getLines().length, 1);

const order = {
  id: 'CP-1234',
  buyer: { fullName: 'Ana Cruz', email: 'ana@example.com' },
  items: Cart.getLines(),
  subtotal: Cart.subtotal(),
};
Cart.saveOrder(order);
Cart.clear();
assert.strictEqual(Cart.count(), 0);
assert.strictEqual(Cart.getLastOrder().id, 'CP-1234');

const MOBILE_RE = /^(09\d{9}|\+639\d{9}|639\d{9})$/;
assert.ok(MOBILE_RE.test('09171234567'));
assert.ok(MOBILE_RE.test('+639171234567'));
assert.ok(!MOBILE_RE.test('12345'));

console.log('smoke ok');
