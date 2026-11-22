const { v4: uuidv4 } = require("uuid");
const menuModel = require("../models/menuModel");
const orderModel = require("../models/orderModel");

exports.renderCart = async (req, res, next) => {
  try {
    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    const uniqueIds = [...new Set(cart.map((c) => Number(c.itemId)))];
    const items = await menuModel.getByIds(uniqueIds);
    const quantityById = new Map(cart.map((line) => [Number(line.itemId), Number(line.qty)]));
    const cartItems = items.map((item) => ({ ...item, cart_qty: quantityById.get(Number(item.item_id)) || 1 }));
    res.render('cart', {
      username: req.user.name,
      userid: req.user.id,
      items: cartItems,
      cart,
      item_count: cart.reduce((sum, line) => sum + Number(line.qty || 0), 0),
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCart = (req, res) => {
  const cartItems = Array.isArray(req.body.cart) ? req.body.cart : [];
  const normalized = [];
  for (const item of cartItems) {
    const itemId = Number(item && item.itemId);
    const qty = Number(item && item.qty);
    if (!Number.isSafeInteger(itemId) || itemId <= 0 ||
        !Number.isSafeInteger(qty) || qty <= 0 || qty > 99) continue;
    const existing = normalized.find((entry) => entry.itemId === itemId);
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else normalized.push({ itemId, qty });
  }
  req.session.cart = normalized;
  res.sendStatus(200);
};

exports.checkout = async (req, res, next) => {
  try {
    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    if (cart.length === 0) {
      req.flash('error', 'Your cart is empty. Add food items before checkout.');
      return res.redirect('/cart');
    }

    // The session cart defines which products may be ordered. Quantities may be
    // adjusted on the cart page, but item IDs must exactly match the session cart.
    const submittedIds = [].concat(req.body.itemid || []).map(String);
    const submittedQuantities = [].concat(req.body.quantity || []).map(String);
    const sessionIds = cart.map((line) => String(line.itemId));
    if (!submittedIds.length || submittedIds.length !== submittedQuantities.length ||
        submittedIds.length !== sessionIds.length ||
        submittedIds.some((id) => !sessionIds.includes(id)) ||
        new Set(submittedIds).size !== submittedIds.length) {
      req.flash('error', 'Invalid cart details. Please review your cart.');
      return res.redirect('/cart');
    }
    const quantityById = new Map(submittedIds.map((id, index) => [id, submittedQuantities[index]]));
    const orderLines = [];
    for (const line of cart) {
      const itemId = Number(line.itemId);
      const rawQty = quantityById.get(String(line.itemId));
      const quantity = Number(rawQty);
      if (!Number.isSafeInteger(itemId) || itemId <= 0 ||
          !/^[1-9]\d*$/.test(rawQty) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
        req.flash('error', 'Your cart contains invalid item quantities. Please update it.');
        return res.redirect('/cart');
      }
      const item = await menuModel.getById(itemId);
      if (!item) {
        req.flash('error', 'One of the selected food items is no longer available.');
        return res.redirect('/cart');
      }
      const unitPrice = Number(item.item_price);
      const lineTotal = unitPrice * quantity;
      if (!Number.isSafeInteger(unitPrice) || unitPrice < 0 || !Number.isSafeInteger(lineTotal)) {
        throw new Error('Invalid item price encountered during checkout.');
      }
      orderLines.push({
        orderId: uuidv4(), userId: req.user.id, itemId,
        quantity, price: lineTotal, datetime: new Date(),
      });
    }

    await orderModel.createMany(orderLines);
    req.session.cart = [];
    return res.render('confirmation', { username: req.user.name, userid: req.user.id });
  } catch (err) {
    next(err);
  }
};
