-- Add explicit Cash on Delivery tracking and prevent duplicate customer accounts.
ALTER TABLE orders
  ADD COLUMN payment_method ENUM('COD') NOT NULL DEFAULT 'COD',
  ADD COLUMN payment_status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending';

ALTER TABLE users
  ADD UNIQUE KEY uq_users_email (user_email);

ALTER TABLE admin
  ADD UNIQUE KEY uq_admin_email (admin_email);
