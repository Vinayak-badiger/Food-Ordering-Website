jest.mock('../../src/models/menuModel');
jest.mock('../../src/models/orderModel');

const menuModel = require('../../src/models/menuModel');
const orderModel = require('../../src/models/orderModel');
const cartController = require('../../src/controllers/cartController');

const mockReq = (body = {}, sessionCart = []) => ({
  body,
  user: { id: 1, name: 'Test' },
  session: { cart: sessionCart, user: { id: 1, name: 'Test' } },
  flash: jest.fn(),
});
const mockRes = () => ({
  render: jest.fn(), redirect: jest.fn(), sendStatus: jest.fn(),
});

afterEach(() => jest.clearAllMocks());

test('checkout uses database price and session-authorized item IDs', async () => {
  menuModel.getById.mockResolvedValue({ item_id: 5, item_price: 200 });
  orderModel.createMany.mockResolvedValue(undefined);
  const req = mockReq({ itemid: '5', quantity: '2', subprice: '1' }, [{ itemId: 5, qty: 1 }]);
  const res = mockRes();
  await cartController.checkout(req, res, jest.fn());
  expect(orderModel.createMany).toHaveBeenCalledWith([
    expect.objectContaining({ userId: 1, itemId: 5, quantity: 2, price: 400 }),
  ]);
  expect(req.session.cart).toEqual([]);
  expect(res.render).toHaveBeenCalledWith('confirmation', { username: 'Test', userid: 1 });
});

test('checkout rejects item IDs not present in the session cart', async () => {
  const req = mockReq({ itemid: '99', quantity: '1' }, [{ itemId: 5, qty: 1 }]);
  const res = mockRes();
  await cartController.checkout(req, res, jest.fn());
  expect(orderModel.createMany).not.toHaveBeenCalled();
  expect(res.redirect).toHaveBeenCalledWith('/cart');
});

test('checkout rejects zero and negative quantities', async () => {
  for (const quantity of ['0', '-2', '1.5', '100']) {
    const req = mockReq({ itemid: '5', quantity }, [{ itemId: 5, qty: 1 }]);
    const res = mockRes();
    await cartController.checkout(req, res, jest.fn());
    expect(orderModel.createMany).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/cart');
  }
});

test('checkout rejects an empty session cart', async () => {
  const req = mockReq({}, []);
  const res = mockRes();
  await cartController.checkout(req, res, jest.fn());
  expect(orderModel.createMany).not.toHaveBeenCalled();
  expect(res.redirect).toHaveBeenCalledWith('/cart');
});
