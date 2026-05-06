# Product Manager

Developer handover guide for quickly cloning, running, and continuing this project.

## 1. What this project is

Full-stack product management app:
- Frontend: React + Vite + Tailwind + Zustand
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT with `admin` / `viewer` roles
- Media: Cloudinary upload support via Multer

## 2. Repository structure

```text
product-manager/
  client/                 # React app (Vite)
  server/                 # Express API
  package.json            # root scripts to run both apps
```

Important backend files:
- `server/index.js` - app entry, security middleware, route mounting
- `server/config/db.js` - MongoDB connection
- `server/routes/*.js` - API routes
- `server/controllers/*.js` - business logic
- `server/middleware/authMiddleware.js` - JWT auth + role authorization
- `server/middleware/upload.js` - Multer upload handling

Important frontend files:
- `client/src/App.jsx` - route setup (`/login`, `/dashboard`)
- `client/src/lib/axios.js` - API client + JWT interceptors
- `client/src/store/authStore.js` - auth state
- `client/src/store/index.js` - product/category stores

## 3. Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)
- Cloudinary account (for image upload)

## 4. First-time setup

### Clone and install

```bash
git clone <your-repo-url>
cd product-manager
npm run install:all
```

### Configure backend env

Copy example:

```bash
cp server/.env.example server/.env
```

Then update `server/.env` values:

```env
MONGODB_URI=your_mongodb_connection_string_here
PORT=5000
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
JWT_EXPIRES_IN=7d
```

### Configure frontend env

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## 5. Run in development

From project root:

```bash
npm run dev
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 6. Available scripts

Root (`package.json`):
- `npm run dev` - run client + server together
- `npm run server` - run backend only
- `npm run client` - run frontend only
- `npm run install:all` - install root + server + client dependencies

Backend (`server/package.json`):
- `npm run dev` - run with nodemon
- `npm start` - run with node

Frontend (`client/package.json`):
- `npm run dev`
- `npm run build`
- `npm run preview`

## 7. Auth and permissions

- Register endpoint creates users as `viewer` by default.
- JWT token is stored in Zustand persisted storage (`auth-storage`).
- Axios request interceptor attaches token to `Authorization` header.
- Axios response interceptor auto-logs out on `401`.

Role policy in backend routes:
- Products and categories `GET`: authenticated `admin` and `viewer`
- Products and categories `POST/PUT/DELETE`: `admin` only

## 8. API overview

Health:
- `GET /api/health`

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)

Products:
- `GET /api/products` (supports query: `search`, `category`, `page`, `limit`)
- `GET /api/products/:id`
- `POST /api/products` (admin, supports multipart with `image`)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

Categories:
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

## 9. Common issues

1. CORS error
- Ensure `CLIENT_URL` in `server/.env` matches your frontend URL exactly.

2. `401 Unauthorized`
- Token expired or invalid; log in again.
- Confirm `JWT_SECRET` is set and stable.

3. Mongo connection failure
- Check `MONGODB_URI` and that MongoDB/Atlas is reachable.

4. Image upload fails
- Verify Cloudinary env values.
- Confirm request is `multipart/form-data` with field name `image`.

## 10. Suggested next improvements

- Add automated tests (API + frontend store/unit tests)
- Add seed script for initial admin user
- Add Docker setup for one-command onboarding
- Add CI workflow for lint/test/build
