const bcrypt = require("bcryptjs");
const { promisify } = require('util');
const regenerateSession = (req) => promisify(req.session.regenerate).call(req.session);
const destroySession = (req) => promisify(req.session.destroy).call(req.session);
const userModel = require("../models/userModel");

exports.renderSignUpPage = (req, res) => {
  res.render("signup");
};

exports.signUp = async (req, res, next) => {
  try {
    const { name, address, email, mobile, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/signup');
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findByEmail(normalizedEmail);
    if (existingUser) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/signup');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.create({
      name,
      address,
      email: normalizedEmail,
      password: hashedPassword,
      mobile,
    });
    req.flash("success", "Account created. Please sign in.");
    res.redirect("/signin");
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/signup');
    }
    next(err);
  }
};

exports.renderSignInPage = (req, res) => {
  res.render("signin");
};

exports.signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email.trim().toLowerCase());
    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/signin");
    }
    const match = await bcrypt.compare(password, user.user_password);
    if (!match) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/signin");
    }
    await regenerateSession(req);
    req.session.user = { id: user.user_id, name: user.user_name };
    res.redirect("/homepage");
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  destroySession(req).then(() => {
    res.clearCookie('food_ordering.sid');
    res.redirect('/signin');
  }).catch(next);
};
