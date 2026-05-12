# Product Manager

Full-stack product management app with role-based authentication, product/category CRUD, and image upload support.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + Zustand
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT in `HttpOnly` cookie (`admin` / `viewer`)
- Uploads: Multer + Cloudinary

## Project Structure

```text
product-manager/
  client/                 # React app
  server/                 # Express API
  package.json            # root scripts for running both apps
```

Important backend files:
- `server/src/server.js` - server bootstrap + DB connection
- `server/src/app/app.js` - middleware + route mounting
- `server/src/common/config/db.js` - MongoDB connection
- `server/src/common/middleware/authMiddleware.js` - JWT + role checks
- `server/src/common/middleware/upload.js` - Multer upload config
- `server/src/modules/**` - module-based routes/controllers/models

Important frontend files:
- `client/src/app/App.jsx` - app routes
- `client/src/shared/lib/apiClient.js` - axios instance + cookie credentials
- `client/src/features/auth/store/authStore.js` - auth state
- `client/src/app/store/index.js` - product/category/theme stores

## Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

## Setup

1. Install dependencies (root + server + client):

```bash
npm run install:all
```

2. Create backend environment file:

PowerShell:
```powershell
Copy-Item server/.env.example server/.env
```

macOS/Linux:
```bash
cp server/.env.example server/.env
```

3. Update `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string_here
PORT=5000
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Run in Development

From the project root:

```bash
npm run dev
```

Local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `GET http://localhost:5000/api/health`

## Available Scripts

Root:
- `npm run dev` - run client + server together
- `npm run server` - run backend only
- `npm run client` - run frontend only
- `npm run install:all` - install all dependencies

Server (`server/package.json`):
- `npm run dev` - start with nodemon
- `npm start` - start with node

Client (`client/package.json`):
- `npm run dev`
- `npm run build`
- `npm run preview`

## Authentication & Permissions

- New users are registered as `viewer` by default.
- JWT is stored in an `HttpOnly` auth cookie so the browser can send it securely without exposing it to client-side JavaScript.
- Client requests use `withCredentials: true`, and auth is restored by calling `GET /api/auth/me`.
- On `401`, client clears in-memory user state and prompts re-login.

Role policy:
- `GET` products/categories: authenticated `admin` and `viewer`
- `POST`/`PUT`/`DELETE` products/categories: `admin` only

## API Overview

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected)

Products:
- `GET /api/products` (`search`, `category`, `page`, `limit`)
- `GET /api/products/:id`
- `POST /api/products` (admin, multipart with `image`)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

Categories:
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

## Troubleshooting

1. CORS errors:
- Ensure `CLIENT_URL` in `server/.env` exactly matches your frontend URL.
- If frontend and backend are on different origins, keep client requests credentialed and make sure the browser accepts the auth cookie.

2. `401 Unauthorized`:
- Log in again (token may be expired/invalid).
- Ensure `JWT_SECRET` is set and unchanged for issued tokens.

3. MongoDB connection issues:
- Verify `MONGODB_URI` and network access to MongoDB/Atlas.

4. Image upload failures:
- Verify Cloudinary env values.
- Ensure request is `multipart/form-data` with field name `image`.
