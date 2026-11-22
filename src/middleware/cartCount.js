exports.attachCartCount = (req, res, next) => {
  const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
  res.locals.cartCount = cart.reduce((total, item) => total + (Number(item.qty) || 0), 0);
  next();
};
