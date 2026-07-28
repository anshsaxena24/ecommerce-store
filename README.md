# ShopZone — Full-Stack E-Commerce Store

A complete e-commerce platform built with **Spring Boot 3** (backend) and **React 18 + Vite** (frontend).

---

## Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — bundled with most IDEs or install separately
- **Node.js 18+** — [Download](https://nodejs.org/)
- **PostgreSQL 14+** — [Download](https://www.postgresql.org/download/)

---

## Setup & Running

### 1. Create the PostgreSQL database

```sql
CREATE DATABASE ecommerce;
```

Default connection settings (edit `backend/src/main/resources/application.properties` if yours differ):
- Host: `localhost:5432`
- Database: `ecommerce`
- Username: `postgres`
- Password: `postgres`

### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

- The backend starts on **http://localhost:8080**
- On first run, Hibernate auto-creates all tables (`ddl-auto=create`)
- The `DataSeeder` automatically seeds users, categories, and 15 products
- Subsequent runs skip seeding (checks if users already exist)

> **Note:** After the first successful run, consider changing `spring.jpa.hibernate.ddl-auto=create` to `update` in `application.properties` to preserve your data between restarts.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

- The frontend starts on **http://localhost:5173**
- API calls are proxied to `http://localhost:8080` via Vite config

---

## Default Accounts

### Admin Accounts
| Email | Password |
|-------|----------|
| admin@store.com | admin123 |
| superadmin@store.com | admin123 |

### User Accounts
| Email | Password |
|-------|----------|
| user1@store.com | user123 |
| user2@store.com | user123 |
| user3@store.com | user123 |

---

## Features

### Customer Features
- Browse all products with filters (category, price range, in-stock, sort)
- Full-text product search
- Product detail page with image gallery and reviews
- Shopping cart with quantity controls
- Checkout with saved or new shipping address
- Order history and order detail view
- Star ratings and reviews (one per user per product)
- JWT-based authentication

### Admin Features (login with admin account)
- Dashboard with stats: total products, orders, users, revenue
- Bar chart of orders by status (Recharts)
- Product management: create, edit, soft-delete with image URLs
- Order management: view all orders, update status via dropdown

---

## Tech Stack

### Backend
- Java 17, Spring Boot 3.2
- Spring Security + JWT (jjwt 0.12)
- Spring Data JPA + Hibernate
- PostgreSQL
- Lombok, Maven

### Frontend
- React 18, Vite 5
- React Router v6
- Axios (with request/response interceptors)
- React Hook Form + Yup validation
- Recharts (admin dashboard)
- Plain CSS Modules (no UI library)

---

## Project Structure

```
ecommerce-store/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/ecommerce/
│       ├── EcommerceApplication.java
│       ├── DataSeeder.java
│       ├── controller/       (AuthController, ProductController, CartController, ...)
│       ├── dto/              (request/response DTOs)
│       ├── exception/        (GlobalExceptionHandler, custom exceptions)
│       ├── model/            (JPA entities + enums)
│       ├── repository/       (Spring Data repositories)
│       ├── security/         (JWT, filter, config)
│       └── service/          (business logic)
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── context/          (AuthContext, CartContext)
        ├── hooks/            (useAuth, useProducts)
        ├── pages/            (all pages + admin/)
        ├── components/       (Navbar, ProductCard, ...)
        └── services/         (api.js, authService, productService, ...)
```

---

## API Overview

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Auth |
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| GET | /api/products/search?q= | Public |
| POST | /api/products | Admin |
| PUT | /api/products/:id | Admin |
| DELETE | /api/products/:id | Admin |
| GET | /api/categories | Public |
| GET | /api/categories/:slug/products | Public |
| POST | /api/categories | Admin |
| GET | /api/cart | Auth |
| POST | /api/cart/items | Auth |
| PATCH | /api/cart/items/:id | Auth |
| DELETE | /api/cart/items/:id | Auth |
| DELETE | /api/cart | Auth |
| POST | /api/orders | Auth |
| GET | /api/orders | Auth |
| GET | /api/orders/:id | Auth |
| GET | /api/orders/all | Admin |
| PATCH | /api/orders/:id/status | Admin |
| GET | /api/addresses | Auth |
| POST | /api/addresses | Auth |
| PUT | /api/addresses/:id | Auth |
| DELETE | /api/addresses/:id | Auth |
| GET | /api/products/:id/reviews | Public |
| POST | /api/products/:id/reviews | Auth |
| GET | /api/admin/dashboard/stats | Admin |
