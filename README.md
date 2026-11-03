# GoodEggs — Premium Farm-to-Consumer E-Commerce Platform

A production-grade, animated, full-stack egg-selling e-commerce platform built with an editorial farm-to-table aesthetic, high-performance interactions, and a robust MongoDB/Express/Node backend.

---

## 🍳 Visual Identity & UI/UX Design

The visual direction directly synthesizes the user reference video into a warm farm-to-table brand:
- **Palette**: Warm farm cream background (`#FDF8EE` / `#FAF4E8`), signature rich yolk yellow (`#FFB800` / `#D97706`), deep organic soil brown (`#2C1810`).
- **Typography**: Editorial serif headings (*Fraunces*) paired with clean geometric body typography (*Plus Jakarta Sans*).
- **Signature Product Cards**:
  - Top-left wishlist heart toggle
  - Top-right star rating pill (`★ 4.9`)
  - Clean centered egg pack photography
  - **Quarter-Circle Radial Corner Button**: The iconic rounded yolk-yellow action tab in the bottom-right corner for instantaneous add-to-basket feedback.
- **Interactive "Morning Carton Builder"**:
  - Direct adaptation of the reference video's virtual fitting room widget!
  - Floats on the bottom-left of the screen, allowing customers to tap any egg variety to pack into a custom 6 or 12-egg moulded pulp carton.
  - Live protein calculator, yolk score index, and price counter with one-click basket checkout.
- **Motion & 3D**:
  - Smooth inertial scroll powered by **Lenis**.
  - **GSAP & Framer Motion** scroll-triggered reveals and micro-interactions.
  - Interactive **Three.js / React Three Fiber** 3D organic egg inspection with lighting and soft contact shadows.

---

## 🏗️ Technology Stack

### Frontend:
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: SCSS (organized design tokens, mixins, CSS modules)
- **Animation**: GSAP, Framer Motion, Lenis Smooth Scroll
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **State Management**: Zustand
- **Routing**: React Router 7
- **HTTP Client**: Axios with JWT Interceptor & Guest Session tracking
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

### Backend:
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM (includes seamless in-memory fallback for frictionless local development)
- **Authentication**: JWT access token + refresh token rotation + bcryptjs password hashing
- **Payments**: Razorpay SDK integration + signature verification + webhook support + dev sandbox simulation
- **Inventory Engine**: Concurrency-safe stock reservations with 15-minute TTL to prevent overselling
- **Email Service**: Resend HTML templates with dev console fallback logger
- **Security**: Helmet, Express Rate Limiter, CORS protection
- **API Documentation**: Swagger UI at `/api-docs`

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo categories, products, coupons & admin accounts
npm run dev      # Starts API server on http://localhost:5000
```
*Swagger API Docs: `http://localhost:5000/api-docs`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@goodeggs.farm` | `admin123456` |
| **Customer** | `customer@goodeggs.farm` | `customer123456` |

*(Fast-fill demo buttons are provided on the Login screen for instant 1-click access!)*

---

## 💳 Razorpay Payment Testing

The platform supports both active Razorpay credentials and development sandbox mode:
1. When real Razorpay API keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are configured in `backend/.env`, the checkout opens the official Razorpay Checkout modal.
2. In development or test mode with placeholder keys, the backend automatically generates a cryptographic mock order and validates signature verification without requiring external banking credentials.

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests:
```bash
cd backend
npm test
```
*Covers health check, product catalogue, category querying, coupon validation, server-side price protection, JWT auth registration, and admin authorization guards.*

### Frontend Unit Tests:
```bash
cd frontend
npm test
```
*Covers Carton Builder slot allocation, pack size switching, slot removal, and shopping cart drawer states.*

---

## 📦 Project Structure

```
egg-web/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, Env, Razorpay, Swagger
│   │   ├── controllers/  # Auth, Products, Cart, Orders, Admin, etc.
│   │   ├── middleware/   # JWT auth, Admin guard, Rate limit, Validation
│   │   ├── models/       # Mongoose schemas (User, Product, Order, Inventory...)
│   │   ├── routes/       # API v1 routes
│   │   ├── services/     # Razorpay, Inventory lock, Resend email
│   │   ├── scripts/      # Database seed script
│   │   └── tests/        # Vitest & Supertest test suite
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/   # Navbar, AnnouncementBar, CartDrawer, CartonBuilderWidget, 3D Egg
│   │   │   └── home/     # Hero, Comparison, ProductSelection, Packaging, FarmStory, FAQ
│   │   ├── pages/        # Home, Shop, ProductDetail, Cart, Checkout, OrderConfirmation, Profile, Admin
│   │   ├── stores/       # Zustand stores (auth, cart, cartonBuilder)
│   │   ├── styles/       # SCSS tokens (_variables, _mixins, _reset, global)
│   │   └── tests/        # Vitest component & store unit tests
│   ├── .env.example
│   └── package.json
└── README.md
```

