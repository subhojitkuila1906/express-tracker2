# Expense-Tracker

A standalone browser-based expense tracker with separate user and administrator experiences.

## Administrator demo

Open `index.html` and select **Admin** on the login screen:

- Email: `admin@expensetracker.com`
- Password: `admin123`

The admin dashboard shows registered-user counts and basic account details, and supports creating, editing, searching, and deleting regular user accounts. Admins can set a password when creating an account, but cannot view or change a user's password while editing. Users' financial records are not shown in the user list.

## Security limitation

This is a front-end-only project for demonstration. Accounts and passwords are stored in browser `localStorage`, and client-side role checks are not secure authorization. Do not use real or sensitive account data. A production deployment needs a backend for authentication, authorization, and protected data storage.
