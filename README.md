# ProductVault — Product Management System

A full-stack product management app built with **Express**, **React**, **Tailwind CSS**, **Mongoose**, and **Zustand**.

## Features

- ✅ Product CRUD (create, read, update, delete)
- ✅ Category management with color labels
- ✅ Search products by name (live search)
- ✅ Filter by category (default: All)
- ✅ Auto-calculated amount = price × quantity
- ✅ Image upload from device (max 5MB)
- ✅ Summary dashboard (total products, quantity, amount)
- ✅ Zustand global state management
- ✅ Dark glass UI with Tailwind CSS

## Tech Stack

| Layer    | Technology                   |
|----------|------------------------------|
| Backend  | Node.js + Express            |
| Database | MongoDB + Mongoose           |
| Upload   | Multer                       |
| Frontend | React + Vite                 |
| Styling  | Tailwind CSS                 |
| State    | Zustand                      |
| UI       | Lucide React, React Hot Toast|

## Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB running locally (or provide a MongoDB Atlas URI)

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/product-manager
```

### 3. Run development servers
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## API Endpoints

### Products
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/products` | List all (supports `?search=&category=`) |
| POST | `/api/products` | Create product (multipart/form-data) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Categories
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

## Project Structure

```
product-manager/
├── package.json              # Root runner (concurrently)
├── server/
│   ├── index.js              # Express entry point
│   ├── .env.example
│   ├── models/
│   │   ├── Product.js        # Mongoose model (auto-calc amount)
│   │   └── Category.js
│   ├── routes/
│   │   ├── products.js
│   │   └── categories.js
│   ├── middleware/
│   │   └── upload.js         # Multer config
│   └── uploads/              # Stored images
└── client/
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── store/index.js    # Zustand stores
        ├── hooks/
        │   └── useDebounce.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── SummaryBar.jsx
        │   ├── SearchFilterBar.jsx
        │   ├── ProductCard.jsx
        │   ├── ProductModal.jsx
        │   └── CategoryModal.jsx
        └── pages/
            └── ProductsPage.jsx
```
