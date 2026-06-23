# Basic REST API

## 1. Cara Setup & Install

1. Pastikan Node.js terpasang (direkomendasikan Node.js 18+).
2. Clone atau salin repositori ini ke mesin Anda.
3. Masuk ke folder proyek:
   ```bash
   cd c:/srccode/basic-rest-api
   ```
4. Install dependency:
   ```bash
   npm install
   ```
5. Buat file `.env` di root proyek dengan isi minimal seperti berikut:
   ```env
   PORT=5000
   DATABASE_URL=mysql://username:password@localhost:3306/database_name
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   APP_NAME=basic-rest-api
   APP_VERSION=1.0.0
   ```
   > Jika menggunakan MySQL di XAMPP dan port default tidak 3306, sesuaikan `DATABASE_URL` dengan port yang benar.
   > **Catatan**: Jika terjadi error koneksi database terkait *public key retrieval* atau autentikasi, tambahkan parameter `?allowPublicKeyRetrieval=true` di akhir URL.
6. Jalankan migrasi Prisma:
   ```bash
   npx prisma migrate deploy
   ```
   atau jika ingin menggunakan mode development:
   ```bash
   npx prisma migrate dev
   ```
7. Jalankan seed database:
   ```bash
   npm run db:seed
   ```
8. Mulai server:
   ```bash
   npm run dev
   ```
   atau untuk production:
   ```bash
   npm start
   ```

## 2. Struktur Folder Proyek

```
basic-rest-api/
├── package.json
├── prisma.config.ts
├── README.md
├── media/
├── postman_collection/
│   ├── basic-rest-api.postman_collection_week3.json
│   ├── basic-rest-api.postman_collection_week6.json
│   ├── basic-rest-api.postman_collection_week7-8.json
│   └── basic-rest-api.postman_collection.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│       ├── migration_lock.toml
│       ├── 20260604150948_init_schema/
│       │   └── migration.sql
│       ├── 20260610031330_add_refresh_token/
│       │   └── migration.sql
│       └── 20260616120000_add_activity_log/
│           └── migration.sql
└── src/
    ├── index.js
    ├── config/
    │   ├── index.js
    │   └── prisma.js
    ├── controllers/
    │   ├── activityLog.controller.js
    │   ├── auth.controller.js
    │   ├── healthController.js
    │   └── tasks.controller.js
    ├── data/
    │   └── tasks.store.js
    ├── docs/
    │   └── swagger.js
    ├── middleware/
    │   ├── authenticate.js
    │   └── validate.js
    ├── repositories/
    │   ├── activityLog.repository.js
    │   ├── refreshToken.repository.js
    │   ├── task.repository.js
    │   └── user.repository.js
    ├── routes/
    │   ├── activityLog.routes.js
    │   ├── auth.routes.js
    │   ├── index.js
    │   ├── tasks.routes.js
    │   └── users.routes.js
    ├── services/
    │   └── auth.service.js
    └── validators/
        ├── activityLog.validator.js
        ├── auth.validator.js
        └── task.validator.js
```

## 3. Daftar Endpoint API

### 3.1 Endpoint publik

- `GET /health`
- `GET /api/info`
- `GET /api/echo/:msg`

### 3.2 Auth (tanpa prefix `/api/v1` kecuali `/auth/me` hanya untuk token valid)

> Endpoint ini dilindungi oleh **Rate Limiting** ketat untuk mencegah serangan *brute force* (contoh: limit request untuk `/auth/login` dan `/auth/refresh`). Password dienkripsi dengan kuat dan aman menggunakan algoritma **Argon2id**.

- `POST /auth/register` — registrasi user baru
- `POST /auth/login` — login dan dapatkan access token
- `POST /auth/refresh` — refresh access token
- `POST /auth/logout` — logout
- `GET /auth/me` — detail user saat ini (butuh access token)

### 3.3 API terlindungi (`/api/v1`)

> Endpoint di bawah ini dilindungi secara global oleh **CORS**, **Helmet**, dan **Rate Limiting**. Akses data dilindungi melalui **Role-Based Access Control (RBAC)** dan *tenant isolation* (User hanya bisa melihat dan memanipulasi datanya sendiri).

#### Tasks
- `GET /api/v1/tasks` — daftar task milik user yang login dengan pagination, filter, sort
- `POST /api/v1/tasks` — buat task baru
- `GET /api/v1/tasks/:id` — detail task berdasarkan ID
- `PUT /api/v1/tasks/:id` — ganti seluruh data task
- `PATCH /api/v1/tasks/:id` — perbarui sebagian task
- `DELETE /api/v1/tasks/:id` — hapus task
- `GET /api/v1/tasks/:id/activity` — daftar activity log untuk task

#### Activity Logs
- `GET /api/v1/activity-logs` — daftar activity log
- `POST /api/v1/activity-logs` — buat activity log baru
- `GET /api/v1/activity-logs/:id` — detail activity log
- `PUT /api/v1/activity-logs/:id` — ganti seluruh data activity log
- `PATCH /api/v1/activity-logs/:id` — perbarui sebagian activity log
- `DELETE /api/v1/activity-logs/:id` — hapus activity log

#### Users
- `GET /api/v1/users/:userId/tasks` — ambil semua task milik user tertentu

#### Admin (Hanya untuk user dengan role `ADMIN`)
- `GET /api/v1/admin/users` — ambil semua user di sistem
- `PATCH /api/v1/admin/users/:id/role` — ubah role user (menjadi `USER` atau `ADMIN`)
- `GET /api/v1/admin/tasks` — lihat semua task dari seluruh user

### 3.4 Dokumentasi Swagger

- `GET /api/docs`
- `GET /api/docs.json`

## 4. ERD Database

### Entitas utama

- `users`
  - `id` (Int, PK)
  - `name` (String)
  - `email` (String, unique)
  - `password` (String)
  - `role` (Enum: USER, ADMIN)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

- `tasks`
  - `id` (Int, PK)
  - `title` (String)
  - `description` (Text, optional)
  - `status` (Enum: TODO, IN_PROGRESS, DONE)
  - `priority` (Enum: LOW, MEDIUM, HIGH)
  - `dueDate` (DateTime, optional)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
  - `userId` (Int, FK ke `users.id`)
  - `categoryId` (Int, FK ke `categories.id`, nullable)

- `categories`
  - `id` (Int, PK)
  - `name` (String, unique)
  - `color` (String)
  - `createdAt` (DateTime)

- `refresh_tokens`
  - `id` (Int, PK)
  - `token` (String, unique)
  - `userId` (Int, FK ke `users.id`)
  - `expiresAt` (DateTime)
  - `isRevoked` (Boolean)
  - `createdAt` (DateTime)

- `activity_logs`
  - `id` (Int, PK)
  - `taskId` (Int, FK ke `tasks.id`)
  - `userId` (Int, FK ke `users.id`)
  - `action` (Enum: CREATED, UPDATED, DELETED)
  - `changes` (Json)
  - `createdAt` (DateTime)

### Hubungan (Relasi)

- `users` 1 → N `tasks`
- `users` 1 → N `refresh_tokens`
- `users` 1 → N `activity_logs`
- `tasks` N → 1 `users`
- `tasks` N → 1 `categories` (nullable)
- `tasks` 1 → N `activity_logs`
- `activity_logs` N → 1 `tasks`
- `activity_logs` N → 1 `users`

### Enum

- `Status`: `TODO`, `IN_PROGRESS`, `DONE`
- `Priority`: `LOW`, `MEDIUM`, `HIGH`
- `ActivityAction`: `CREATED`, `UPDATED`, `DELETED`
- `Role`: `USER`, `ADMIN`

