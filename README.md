# Food Ordering Website
As the name says it all, it a simple full stack project which is used for ordering food from your favourite restaurant. It is a user friendly and responsive website. 

## Features :
- The project has two interface i.e. an user interface and an admin interface.
- At user-end he/she can ony order food and set the quantity as per there requirment.
- At user-end he/she can also view there profile details and order history.
- At user-end he/she can change their basic contact details and as well as there password. 
- At admins-end he/she can perform two task : 
    - Add new food to the food menu.
    - Change the price of cuisine as per inflation rate.
    - View and dispatch order of the customers.
- Admin can also verify the working of the website from his own end.
- Use cookies for login into the account.

## Build With :
<ul>
    <li><a href="https://www.w3schools.com/html/" target="_blank">HTML</a></li>
    <li><a href="https://www.w3schools.com/css/" target="_blank">CSS</a></li>
    <li><a href="https://www.w3schools.com/js/" target="_blank">JavaScript</a></li>
    <li><a href="https://www.w3schools.com/bootstrap5/index.php" target="_blank">Bootstrap</a></li>
    <li><a href="https://expressjs.com/" target="_blank">ExpressJS</a></li>
    <li><a href="https://www.w3schools.com/mysql/default.asp" target="_blank">MySQL</a></li>
</ul>

## Install and Run :
- Clone the repository or download the zip folder.
- Extract the zip folder.
- **Fresh install:** import `db/schema.sql` into MySQL 5.7+/8 or MariaDB. It already contains the final structure (order status, COD payment tracking, unique emails, decimal ratings) and a bcrypt-hashed admin account. Do **not** run the migrations on a fresh import.
- **Upgrading an old database** created from the original schema: apply the SQL files in `db/migrations/` in filename order, then run `db/seed_admin_bcrypt.sql`.
- Development credentials: admin `admin_fury@gmail.com` / `123456789`; sample customers `iamspiderman@gmail.com` and `iamironman@gmail.com` / `123456789`. Replace these before using the app beyond local development.
- Install NodeJS in your system.
- Go to the folder where you have extracted or cloned the project.
- Open command prompt or terminal having the same location where your project is.
- Type ``` npm install ``` in your command prompt or terminal.
- Now to run the project on your server type ``` npm start ``` .

## Screenshot :
Here are some of the screenshot of Food Ordering Website.

1. Landing Page :<br><br> <img src="screenshot/Landing Page.png"><br><br>
2. SignUp  Page :<br><br> <img src="screenshot/Sign Up Page.png"><br><br>
3. SignIn Page :<br><br> <img src="screenshot/Sign In Page.png"><br><br>
4. Home Page : <br><br> <img src="screenshot/Homepage.png"><br><br>
5. Menu List : <br><br> <img src="screenshot/Menu Cart.png"><br><br>
6. Cart Page : <br><br> <img src="screenshot/My Cart Page.png"><br><br>
7. Confirmation Page :<br><br> <img src="screenshot/Order Confirmation Page.png"><br><br>
8. Details and Order History Page :<br><br> <img src="screenshot/Details and Order History Page.png"><br><br>
9. Settings Page :<br><br> <img src="screenshot/Settings Page.png"><br><br>
10. Sign Out Option :<br><br> <img src="screenshot/Sign Out.png"><br><br>
11. Admin Sign In Page : <br><br> <img src="screenshot/Admin Login Page.png"><br><br>
12. Admin Welcome Page :<br><br> <img src="screenshot/Admin Welcome Page.png"><br><br>
13. Admin Adding Food Page :<br><br> <img src="screenshot/Admin Adding Food Page.png"><br><br>
14. Changing Price of Cuisine :<br><br> <img src="screenshot/Changing Price of Cuisine.png"><br><br>
14. Admin Order View & Dispatching Page :<br><br> <img src="screenshot/Admin Viewing and Dispatching Order Page.png"><br><br>

## Environment configuration

Copy `.env.example` to `.env` and set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a long random `SESSION_SECRET`. Do not use the example session secret outside local development. Start MySQL before running `npm start`.

## Test

Run `npm ci` followed by `npm test`. The app requires MySQL and the database migrations before the full browser workflow can be exercised.

## Payment

This application supports Cash on Delivery only. New orders are stored with `payment_method = 'COD'` and `payment_status = 'pending'`. An admin should mark payment as paid only after cash has actually been collected; an online gateway is not included.
