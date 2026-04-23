# Product Manager

Full-stack product management app with a React client and Express API.

## Structure

### Client

- `client/src/app`: app bootstrap and global stores
- `client/src/features`: feature modules like auth, dashboard, categories, and products
- `client/src/shared`: shared api, UI, hooks, and styles

### Server

- `server/src/app`: express app composition
- `server/src/config`: database and third-party config
- `server/src/modules`: feature modules like auth, categories, and products
- `server/src/shared`: shared middleware and models

## Run

```bash
npm run install:all
npm run dev
```

## Roles

- `user`: read-only access
- `admin`: manage products and categories
- `super_admin`: manage users, promote/demote `user` and `admin`, and delete non-super-admin accounts

To bootstrap the first super admin, set `SUPER_ADMIN_EMAIL` in `server/.env` to the email address that should own the account.
