jest.mock('../../src/models/orderModel');
jest.mock('../../src/models/adminModel');
jest.mock('../../src/models/menuModel');

const orderModel = require('../../src/models/orderModel');
const adminController = require('../../src/controllers/adminController');

const mockRes = () => {
  const res = {};
  res.redirect = jest.fn();
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};
const mockReq = (body, json) => ({ body, flash: jest.fn(), is: jest.fn().mockReturnValue(json ? 'json' : false) });

afterEach(() => jest.clearAllMocks());

test('dispatchOrders dispatches selected pending orders and answers JSON callers', async () => {
  orderModel.setDispatched.mockResolvedValue({ affectedRows: 1 });
  const req = mockReq({ order_id_s: ['a', 'b', 'a'] }, true);
  const res = mockRes();
  await adminController.dispatchOrders(req, res, jest.fn());
  expect(orderModel.setDispatched).toHaveBeenCalledTimes(2);
  expect(res.json).toHaveBeenCalledWith({ dispatched: 2 });
  expect(req.flash).toHaveBeenCalledWith('success', '2 order(s) dispatched.');
});

test('dispatchOrders rejects an empty selection', async () => {
  const req = mockReq({}, false);
  const res = mockRes();
  await adminController.dispatchOrders(req, res, jest.fn());
  expect(orderModel.setDispatched).not.toHaveBeenCalled();
  expect(res.redirect).toHaveBeenCalledWith('/admin_view_dispatch_orders');
});

test('dispatchOrders reports when nothing matched (already dispatched / unknown id)', async () => {
  orderModel.setDispatched.mockResolvedValue({ affectedRows: 0 });
  const req = mockReq({ order_id_s: 'zzz' }, true);
  const res = mockRes();
  await adminController.dispatchOrders(req, res, jest.fn());
  expect(req.flash).toHaveBeenCalledWith('error', 'No pending orders matched the selection.');
});
