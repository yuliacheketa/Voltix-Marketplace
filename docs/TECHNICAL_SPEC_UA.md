## Технічне завдання (ТЗ) — Voltix Marketplace (наявний проєкт)

### 1) Мета документа

Цей документ описує вимоги та поточну архітектуру монорепозиторію **Voltix Marketplace**, побудованого на **мікрофронтендах** з **Webpack 5 Module Federation**, а також бекенд-API на **Node.js/Express + Prisma**.

Документ призначений для:

- узгодження вимог між командою продукту/дизайну/розробки;
- формування беклогу задач;
- визначення меж відповідальності кожного мікрофронтенда та бекенду;
- визначення acceptance criteria для релізів.

---

### 2) Обсяг та межі (Scope)

#### 2.1. У межах проєкту

- **Shell (Host)** — маршрутизація, навігація, хостинг ремоутів.
- **Catalog (Remote, React)** — каталог товарів, пошук/фільтри, сторінка товару.
- **Auth (Remote, React)** — реєстрація/логін/верифікація email, сесія.
- **Profile (Remote, React)** — профіль користувача, адреси, замовлення.
- **Seller Dashboard (Remote, React)** — кабінет продавця (магазин, товари, замовлення, статистика).
- **Checkout (Remote, Vue 2)** — кошик, чек-аут флоу, підтвердження замовлення (через API-клієнт).
- **Backend (API, Express/Prisma)** — авторизація, користувачі, продавець, замовлення, відгуки.
- **Shared libs** — `@voltix/utils`, `@voltix/api-client`, `@voltix/shared-state`, `@voltix/ui-kit`.

#### 2.2. Поза межами (поки що)

- Реальні платіжні провайдери (Stripe/PayPal) — емульовано флоу без списання коштів.
- Email-сервіс/SMTP — логіка верифікації є, доставка листа може бути мок/спрощення (залежить від реалізації бекенду).
- Повноцінний каталог на бекенді (`/products`, `/categories`) — у `@voltix/api-client` є режим dummyJson за відсутності baseURL.

---

### 3) Стейкхолдери та ролі

#### 3.1. Ролі користувачів (з бекенду / Prisma Role)

- **CUSTOMER**: покупець, оформлення замовлень, профіль, адреси, відгуки.
- **SELLER**: продавець, керування магазином/товарами/замовленнями, перегляд статистики.
- **MODERATOR / ADMIN**: передбачені типами, але набір UI/ендпоінтів може бути не повний в поточній версії.

#### 3.2. Основні користувацькі сценарії

- **Гість**: перегляд каталогу, сторінки товару; перехід до логіну/реєстрації; перегляд кошика (якщо дозволено).
- **Покупець**: логін → керування профілем → адреси → замовлення → відгуки.
- **Продавець**: реєстрація як SELLER → керування магазином → CRUD товарів → керування замовленнями → статистика.

---

### 4) Архітектура рішення

#### 4.1. Монорепозиторій

- NPM workspaces: `apps/*`, `libs/*`.

#### 4.2. Module Federation

- **Shell** підключає ремоути:
  - `catalog@http://localhost:3001/remoteEntry.js`
  - `checkout@http://localhost:3002/remoteEntry.js`
  - `auth@http://localhost:3004/remoteEntry.js`
  - `profile@http://localhost:3005/remoteEntry.js`
  - `sellerDashboard@http://localhost:3006/remoteEntry.js`

#### 4.3. Комунікація між мікрофронтендами

- **Shared state** через `@voltix/shared-state`:
  - `authStore` (сесія/токен/гідратація);
  - `cartStore` (кошик, total).
- **Подієва взаємодія** (Shell слухає):
  - `window` events: `voltix:unauthorized`, `voltix:forbidden` → редіректи.

#### 4.4. API клієнт

- `@voltix/api-client`:
  - зчитує `API_URL` (baseURL) з environment (через DefinePlugin у webpack-конфігах);
  - якщо baseURL не заданий — використовує `dummyJson` для каталогу/замовлень у демо-режимі.

---

### 5) Нефункціональні вимоги

#### 5.1. Якість та підтримуваність

- Узгоджений стиль коду (Prettier).
- ESLint для JS/TS (залежить від конфігів у репо).

#### 5.2. Продуктивність

- Мікрофронтенди завантажуються ліниво (React `lazy()` / MF runtime).
- Рекомендовано уникати дублювання залежностей через MF `shared` (singleton).

#### 5.3. Безпека

- JWT авторизація (Bearer token).
- Захист рольовими перевірками на бекенді (`requireAuth`, `requireRole`).
- Валідація payload через Zod на бекенді.
- CORS відкритий (`Access-Control-Allow-Origin: *`) — для продакшну потрібно обмежувати домени.

#### 5.4. Сумісність

- Shell/React-ремоути: React (у репо використовуються React 19.x).
- Checkout: Vue 2.7.x + vue-router 3.x (поточна реалізація).

---

### 6) Опис модулів фронтенду

#### 6.1. Shell (Host)

**Відповідальність:**

- глобальна навігація;
- маршрутизація на `/*`, `/auth/*`, `/profile/*`, `/seller/*`, `/checkout/*`;
- хостинг `checkout` через контейнерний компонент (mount/unmount).

**Acceptance criteria:**

- При недоступності remote — Shell показує дружній fallback (через `Suspense` або хост-компонент).
- Переходи між розділами не ламають стан авторизації.

#### 6.2. Catalog (Remote, React)

**Відповідальність:**

- список товарів, фільтри/сортування, пошук;
- сторінка товару;
- можливість додати в кошик (через shared-state).

**Джерело даних:**

- `@voltix/api-client.getProducts/getProductById/getCategories` (або dummyJson).

#### 6.3. Auth (Remote, React)

**Відповідальність:**

- реєстрація/логін;
- верифікація email;
- `me`/гідратація сесії.

**Джерело даних:**

- бекенд `/api/auth/*` через `@voltix/api-client` (або локальні виклики в app).

#### 6.4. Profile (Remote, React)

**Відповідальність:**

- перегляд/редагування профілю;
- керування адресами;
- перегляд замовлень користувача.

**Джерело даних:**

- бекенд `/api/users/*`, `/api/orders/*` (залежно від реалізації UI).

#### 6.5. Seller Dashboard (Remote, React)

**Відповідальність:**

- налаштування магазину;
- CRUD товарів;
- перегляд/обробка замовлень продавця;
- статистика.

**Джерело даних:**

- бекенд `/api/seller/*`.

#### 6.6. Checkout (Remote, Vue 2)

**Відповідальність:**

- кошик (показ/зміна кількості/видалення);
- чек-аут флоу: контакти → доставка → оплата → підсумок → успіх;
- створення замовлення через API-клієнт.

**Джерело даних:**

- `@voltix/shared-state.cartStore` (кошик);
- `@voltix/api-client.createOrder` (замовлення), або dummyJson якщо `API_URL` не задано.

---

### 7) Backend API (поточні маршрути)

Бекенд слухає порт `PORT` (за замовчуванням **4000**) та має endpoints:

#### 7.1. Health

- `GET /health` → `{ ok: true }`

#### 7.2. Auth

- `POST /api/auth/register`
  - body: `email`, `password`, `confirmPassword`, опційно `role`, опційно `shopName` (обов’язково для `SELLER`)
- `POST /api/auth/login`
- `GET /api/auth/verify-email?token=<token>`
- `GET /api/auth/me` (Bearer)

#### 7.3. Users (Bearer)

- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`
- `GET /api/users/me/orders`
- `POST /api/users/me/addresses`
- `PATCH /api/users/me/addresses/:addressId`
- `DELETE /api/users/me/addresses/:addressId`

#### 7.4. Orders

- `POST /api/orders` (Bearer)
- `GET /api/orders/seller` (Bearer + SELLER)

#### 7.5. Seller (Bearer + SELLER)

- `GET /api/seller/me`
- `PATCH /api/seller/me`
- `GET /api/seller/products`
- `GET /api/seller/products/:productId`
- `POST /api/seller/products`
- `PATCH /api/seller/products/:productId`
- `DELETE /api/seller/products/:productId`
- `GET /api/seller/orders`
- `PATCH /api/seller/orders/:sellerOrderId/status`
- `GET /api/seller/stats`
- `GET /api/seller/categories`

#### 7.6. Reviews

- `POST /api/reviews` (Bearer)

---

### 8) Валідації (backend, Zod) — ключові правила

#### 8.1. Реєстрація

- email валідний
- пароль мін. 8
- `confirmPassword` має співпасти
- якщо роль SELLER — `shopName` обов’язкове (мін. 2 символи)

#### 8.2. Профіль

- `name` 2..100
- `phone` у форматі E.164 (`+XXXXXXXX...`) або `null`
- `avatarUrl` URL або `null`

#### 8.3. Пароль

- `newPassword` 8..128, має містити принаймні 1 велику літеру і 1 цифру
- не може дорівнювати `currentPassword`

#### 8.4. Адреса

- `country` — ISO2 (2 літери, A–Z)
- `phone` — E.164
- `street` 5..200, `zip` 3..20

#### 8.5. Seller product

- `images` мін. 1, **рівно одне** `isMain: true`
- `variants` мін. 1, `stock` >= 0, `price` > 0

#### 8.6. Order create

- `addressId` UUID
- `lines[]` мін. 1, `variantId` UUID, `quantity` > 0
- `deliveryCost` string або number

---

### 9) Конфігурація середовища

#### 9.1. Змінні середовища

- `API_URL` — базова URL для `@voltix/api-client` у фронтендах.
- `PORT` — порт бекенду (default 4000).

---

### 10) Запуск проєкту (Dev)

#### 10.1. Встановлення

- `npm install`

#### 10.2. Запуск фронтенду

- `npm run dev` з кореня:
  - shell: `127.0.0.1:3000`
  - catalog: `127.0.0.1:3001`
  - checkout: `127.0.0.1:3002`
  - auth: `127.0.0.1:3004`
  - profile: `127.0.0.1:3005`
  - seller-dashboard: `127.0.0.1:3006`

#### 10.3. Запуск бекенду

- `npm run dev -w @voltix/backend` (порт 4000)

---

### 11) Acceptance criteria (загальні)

- Shell завантажується та відкривається на `3000`.
- Всі remotes віддають `remoteEntry.js`.
- Логін/реєстрація працюють проти бекенду при заданому `API_URL`.
- Профіль/адреси/замовлення працюють для авторизованого користувача.
- Seller dashboard доступний тільки для SELLER.
- Checkout проходить флоу і створює order через `createOrder` (API або dummyJson).

---

### 12) Відомі ризики / техборг

- Vue 2 EOL: потрібен план міграції (або чітке обмеження).
- CORS `*` на бекенді — потрібна політика для продакшну.
- Watcher помилки `EMFILE` на macOS — потребує оптимізації watch-налаштувань або системних лімітів.
