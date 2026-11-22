const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { requireUser } = require("../middleware/authMiddleware");
const { validateBody, schemas } = require("../middleware/validate");
const { attachCartCount } = require("../middleware/cartCount");

router.get(
  "/settings",
  requireUser,
  attachCartCount,
  settingsController.renderSettingsPage,
);
router.post(
  "/address",
  requireUser,
  attachCartCount,
  validateBody(schemas.updateAddress, "/settings"),
  settingsController.updateAddress,
);
router.post(
  "/contact",
  requireUser,
  attachCartCount,
  validateBody(schemas.updateContact, "/settings"),
  settingsController.updateContact,
);
router.post(
  "/password",
  requireUser,
  attachCartCount,
  validateBody(schemas.updatePassword, "/settings"),
  settingsController.updatePassword,
);

module.exports = router;
