const { validateBody } = require('../../src/middleware/validate');
const Joi = require('joi');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

test('passes when body is valid', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  const middleware = validateBody(schema);
  const req = { body: { name: 'Alice' } };
  const res = mockRes();
  const next = jest.fn();
  middleware(req, res, next);
  expect(next).toHaveBeenCalledWith();
});

test('returns 400 when body is invalid', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  const middleware = validateBody(schema);
  const req = { body: {} };
  const res = mockRes();
  const next = jest.fn();
  middleware(req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(next).not.toHaveBeenCalled();
});

test('redirects back to the form with a flash message for HTML form posts', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  const middleware = validateBody(schema, '/signup');
  const req = { body: {}, flash: jest.fn(), is: jest.fn().mockReturnValue(false) };
  const res = { ...mockRes(), redirect: jest.fn() };
  const next = jest.fn();
  middleware(req, res, next);
  expect(req.flash).toHaveBeenCalledWith('error', 'name is required');
  expect(res.redirect).toHaveBeenCalledWith('/signup');
  expect(next).not.toHaveBeenCalled();
});

test('still returns JSON 400 for JSON requests even when a redirect is configured', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  const middleware = validateBody(schema, '/signup');
  const req = { body: {}, flash: jest.fn(), is: jest.fn().mockReturnValue('json') };
  const res = { ...mockRes(), redirect: jest.fn() };
  middleware(req, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.redirect).not.toHaveBeenCalled();
});
