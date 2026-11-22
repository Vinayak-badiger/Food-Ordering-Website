const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');
const { doubleCsrf } = require('csrf-csrf');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(
  session({
    name: 'food_ordering.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 4,
    },
  })
);
app.use(flash());
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true, responseOnLimit: 'Image must be under 5 MB' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  getSessionIdentifier: (req) => req.session.id,
  getCsrfTokenFromRequest: (req) => {
    const headerToken = req.headers['x-csrf-token'];
    const bodyToken = req.body && req.body._csrf;
    const queryToken = req.query && req.query._csrf;
    return headerToken || bodyToken || queryToken;
  },
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});

app.use((req, res, next) => {
  // The CSRF token is bound to the session id, so anonymous visitors (sign-in,
  // sign-up) need a persisted session. Do this explicitly instead of relying on
  // connect-flash happening to touch the session.
  if (!req.session.csrfBound) req.session.csrfBound = true;
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

app.use(doubleCsrfProtection);

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use(homeRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(settingsRoutes);
app.use(adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
