const fs = require('fs');
const path = require('path');
const vm = require('vm');

const cartScript = fs.readFileSync(
  path.join(__dirname, '../../public/javascripts/cart.js'),
  'utf8',
);

const loadCartScript = (response) => {
  const fetch = jest.fn().mockResolvedValue(response);
  const document = {
    querySelector: jest.fn().mockReturnValue({ content: 'csrf-token-value' }),
  };
  const window = { location: { href: '' }, alert: jest.fn() };
  const console = { error: jest.fn() };
  const context = vm.createContext({ fetch, document, window, console });

  vm.runInContext(cartScript, context);

  return { context, fetch, document, window, console };
};

test('openMyCart sends the CSRF token and navigates after saving cart', async () => {
  const { context, fetch, window } = loadCartScript({ ok: true, status: 200 });

  vm.runInContext('openMyCart()', context);
  await Promise.resolve();
  await Promise.resolve();

  expect(fetch.mock.calls[0][1].headers['x-csrf-token']).toBe('csrf-token-value');
  expect(window.location.href).toBe('/cart');
  expect(window.alert).not.toHaveBeenCalled();
});

test('openMyCart does not navigate when saving cart fails', async () => {
  const { context, fetch, window } = loadCartScript({ ok: false, status: 403 });

  vm.runInContext('openMyCart()', context);
  await Promise.resolve();
  await Promise.resolve();

  expect(fetch).toHaveBeenCalled();
  expect(window.location.href).toBe('');
  expect(window.alert).toHaveBeenCalledWith(
    'Could not open your cart. Please refresh and try again.',
  );
});

test('initCart seeds the client cart from the session cart so earlier items are kept', () => {
  const { context, fetch } = loadCartScript({ ok: true, status: 200 });
  const counter = { innerHTML: '' };
  const btn = { disabled: false, innerHTML: '' };
  context.document.getElementById = jest.fn((id) => (id === 'cart-number-count' ? counter : id === 'btn5' ? btn : null));
  vm.runInContext('initCart([{ itemId: 5, qty: 2 }, { itemId: "bad", qty: 1 }])', context);
  expect(counter.innerHTML).toBe(2);
  expect(btn.disabled).toBe(true);
  vm.runInContext('openMyCart()', context);
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ cart: [{ itemId: 5, qty: 2 }] });
});
