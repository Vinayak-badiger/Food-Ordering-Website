# Code review and fixes

## Verification performed
- `npm install` + `npm test`: 8 suites / 23 tests pass.
- Full manual workflow executed against a real database (MariaDB 10.11, fresh import of `db/schema.sql`):
  sign-up (incl. validation error and duplicate email) -> sign-in -> menu -> cart -> checkout -> My Orders -> settings -> logout,
  and admin sign-in -> add food (image upload) -> change price -> view pending orders -> dispatch -> customer sees dispatched status.

## Defects found and fixed in this round
1. `db/schema.sql` was stale (no `status`/payment columns, plaintext admin password, old `order_dispatch` table). It now matches the final structure; a fresh import works on its own.
2. Cart page: the "Price" column showed the line total, so changing a quantity produced wrong totals. It now shows the unit price.
3. My Orders multiplied the already-total `price` by quantity (3 x Rs 60 showed Rs 540) and prefixed the Order ID with a currency symbol. Both fixed.
4. Customers could not see pending orders at all. My Orders now lists all orders with a Status column.
5. Cart items were lost when returning to the menu and adding more (the client cart started empty and overwrote the session cart). The menu page now seeds the cart from the session.
6. Flash messages were never rendered on the cart and admin dispatch pages (e.g. "cart is empty" failed silently). Added.
7. Dispatch page called an undefined `checkingDispatch()` and reused one element id for every checkbox. Removed. Dispatch now reports how many orders were actually dispatched.
8. Validation failures on HTML forms returned raw JSON. They now redirect back with a readable message (JSON clients still get 400 JSON).
9. `query.fancybox.min.js` typo caused a 404 on several pages. Fixed.
10. Upload size is now limited at the parser level (5 MB); anonymous-session persistence required by CSRF is now explicit instead of accidental.
11. Buy Now is disabled for an empty cart; dates are shown in a readable format.

## Earlier fixes (previous review)
Password confirmation + duplicate email handling, session regeneration on login, server-side prices at checkout, transactional order inserts, admin logout route, safer uploads, bcrypt sample passwords.

## Remaining recommendations (not changed)
- No way to remove an item from the cart page; quantity edits are only applied at checkout.
- Logout is a GET link (logout-CSRF risk is low but a POST form is better).
- No rate limiting on sign-in; add `express-rate-limit` before going public.
- Behind a reverse proxy in production set `app.set('trust proxy', 1)` so secure cookies work.
- Each cart line becomes its own order row/UUID (admin dispatches per line); group by an order number if you need one-order-per-checkout.
- Admin pages show raw item/user IDs rather than names.
