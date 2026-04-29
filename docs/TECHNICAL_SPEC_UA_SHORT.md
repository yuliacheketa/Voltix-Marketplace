## Стисле ТЗ — Voltix Marketplace (поточний стан)

### 1) Призначення

Voltix Marketplace — e-commerce платформа з **мікрофронтенд-архітектурою** на **Webpack 5 Module Federation** (монорепо на npm workspaces) + **бекенд API** (Node.js/Express + Prisma).

---

### 2) Склад системи (модулі)

#### Frontend (apps/)

- **Shell (host, React)**: маршрутизація/навігація, підключення remotes.
- **Catalog (remote, React)**: каталог, фільтри/пошук, сторінка товару.
- **Auth (remote, React)**: реєстрація/логін/верифікація email/сесія.
- **Profile (remote, React)**: профіль, адреси, замовлення користувача.
- **Seller Dashboard (remote, React)**: кабінет продавця (магазин/товари/замовлення/статистика).
- **Checkout (remote, Vue 2)**: кошик + чек-аут флоу (контакти → доставка → оплата → підсумок → успіх), створення замовлення.

#### Backend (apps/backend)

- REST API для auth/users/seller/orders/reviews, JWT + ролі, Zod-валидація.

#### Shared libs (libs/)

- **`@voltix/utils`**: форматтери/валідації.
- **`@voltix/api-client`**: axios-клієнт, auth helpers, `createOrder`, каталог (є dummyJson fallback без `API_URL`).
- **`@voltix/shared-state`**: zustand stores (auth/cart) для спільного стану між мікрофронтендами.
- **`@voltix/ui-kit`**: React UI компоненти.

---

### 3) Ролі

- **CUSTOMER**: профіль/адреси/замовлення/відгуки.
- **SELLER**: керування магазином/товарами/замовленнями/статистикою.
- **MODERATOR/ADMIN**: типи передбачені, UI/ендпоінти можуть бути частково реалізовані.

---

### 4) Module Federation (порти та remotes)

Shell підключає remotes:

- `catalog` → `http://127.0.0.1:3001/remoteEntry.js`
- `checkout` → `http://127.0.0.1:3002/remoteEntry.js`
- `auth` → `http://127.0.0.1:3004/remoteEntry.js`
- `profile` → `http://127.0.0.1:3005/remoteEntry.js`
- `sellerDashboard` → `http://127.0.0.1:3006/remoteEntry.js`

Маршрути Shell:

- `/` → catalog
- `/auth/*` → auth
- `/profile/*` → profile
- `/seller/*` → seller dashboard
- `/checkout/*` → checkout (mount/unmount контейнером)

---

### 5) Ключові флоу (MVP)

- **Гість**: перегляд каталогу/товару → перехід у auth.
- **CUSTOMER**: login/register → профіль → адреси → замовлення → checkout (за потреби).
- **SELLER**: register як SELLER → налаштування магазину → CRUD товарів → обробка замовлень → статистика.

---

### 6) Backend API (мінімальний перелік)

Base: `http://127.0.0.1:4000`

- **Health**: `GET /health`
- **Auth**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/verify-email?token=...`
  - `GET /api/auth/me` (Bearer)
- **Users (Bearer)**:
  - `GET /api/users/me`
  - `PATCH /api/users/me`
  - `PATCH /api/users/me/password`
  - `GET /api/users/me/orders`
  - `POST /api/users/me/addresses`
  - `PATCH|DELETE /api/users/me/addresses/:addressId`
- **Orders**:
  - `POST /api/orders` (Bearer)
  - `GET /api/orders/seller` (Bearer + SELLER)
- **Seller (Bearer + SELLER)**:
  - `GET|PATCH /api/seller/me`
  - `GET|POST /api/seller/products`, `GET|PATCH|DELETE /api/seller/products/:productId`
  - `GET /api/seller/orders`
  - `PATCH /api/seller/orders/:sellerOrderId/status`
  - `GET /api/seller/stats`
  - `GET /api/seller/categories`
- **Reviews**:
  - `POST /api/reviews` (Bearer)

---

### 7) НФВ (коротко)

- **Auth**: JWT Bearer, рольова авторизація на бекенді.
- **Валідація**: Zod схеми для body/query.
- **CORS**: зараз `*` (для продакшну треба whitelist).
- **Форматування**: Prettier.

---

### 8) Запуск (Dev)

- Встановити: `npm install`
- **Frontend (всі MFE + shell)**: `npm run dev` (shell на `3000`)
- **Backend**: `npm run dev -w @voltix/backend` (API на `4000`)
- Для реальних API-викликів у фронтах: задати `API_URL`, напр. `API_URL=http://127.0.0.1:4000`.
