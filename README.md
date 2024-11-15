# Newspaper website 

**Tech stack**:

Web App MVC

Framework: expressjs

View engine: handlebars

DB: Mongodb

Project Structure:

newspaper-web-app/

├── config/

│   ├── db.js                  # Database connection setup

│   ├── passport.js            # Authentication strategies

│   ├── env/                   # Environment files

│       ├── development.env    # Dev environment variables

│       └── production.env     # Prod environment variables

│   └── settings.js            # General settings and constants

├── controllers/

│   ├── articleController.js   # Controls article actions (view, search, etc.)

│   ├── categoryController.js  # Category management functions

│   ├── authController.js      # Authentication and user-related actions

│   ├── userController.js      # Functions for reader, reporter, editor, and admin subsystems

│   └── adminController.js     # Admin-specific actions

├── models/

│   ├── Article.js             # Article schema and model

│   ├── Category.js            # Category schema and model

│   ├── User.js                # User schema and model (with roles)

│   └── Tag.js                 # Tag schema and model

├── routes/

│   ├── articleRoutes.js       # Routes for article functions (search, view, etc.)

│   ├── userRoutes.js          # Routes for user functions (login, profile update, etc.)

│   ├── adminRoutes.js         # Routes for admin functions

│   ├── categoryRoutes.js      # Routes for category management

│   └── authRoutes.js          # Routes for authentication

├── middlewares/
│   ├── authMiddleware.js      # Middleware for checking roles and permissions

│   └── errorHandler.js        # Global error handling middleware

├── views/

│   ├── layouts/               # Layout files

│       └── main.handlebars    # Main layout for the site

│   ├── partials/              # Partial templates (header, footer, etc.)

│   ├── articles/              # Article-related views

│   ├── admin/                 # Admin-related views

│   ├── auth/                  # Auth views (login, register, etc.)

│   └── home.handlebars        # Homepage

├── public/

│   ├── css/                   # Stylesheets

│   ├── js/                    # Client-side JavaScript

│   └── images/                # Static images

├── app.js                     # Main application entry point

├── package.json               # Project dependencies

└── README.md                  # Project documentation

**Install**:
>> npm install express

>> npm install mongoose

>> npm install passport-local-mongoose

>> npm install passport

>> npm install dotenv

*Start project*

>> node app.js
