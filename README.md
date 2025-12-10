# 🎄 New Year Wishlist 2026

![Project Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=statuspage)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)

> **A modern, festive wishlist application with anonymous authentication, secure sharing, and a beautiful holiday aesthetic.**

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🏗️ Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [📦 Deployment](#-deployment)
  - [VPS Setup](#vps-setup)
- [🔌 API Endpoints](#-api-endpoints)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👤 Author](#-author)

---

## ✨ Features

### 🎁 Core Functionality
- **Anonymous Wishlists**: Create personalized wishlists instantly without email registration.
- **Smart Enrichment**: Integrated **Gemini 3.0 Flash** to auto-fill item details (Price, Image, Title) from Russian marketplaces.
- **Unified Dashboard**: Manage all your wishlists in one place.
- **Gift Booking**: Friends can secretly "claim" items to prevent duplicates.
- **Real-time Updates**: Instant syncing across devices.

### 🔒 Security & Privacy
- **PIN Protection**: Secure your "Editor Mode" with a 4-digit PIN. Only the creator can add/delete/edit items.
- **Anonymous Auth**: Powered by Firebase Anonymous Auth for frictionless but secure user identity.
- **Smart Filters**: Domain filtering and safe parsing for external links.

### 🎨 Visual & UX
- **Festive Theme**: A beautiful interface with deep colors and holiday vibes.
- **Snowfall Animation**: Interactive background effects.
- **Drag & Drop Uploads**: Seamless image uploading for wishlist items.
- **Responsive Design**: Optimized for everything from iPhone SE to 4K functionality.

---

## 🛠️ Tech Stack

This project is built using the bleeding edge of the React ecosystem.

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | [Next.js 15](https://nextjs.org/) | App Router, Server Actions, React Server Components |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type safety across the entire stack |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework with custom neon configuration |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Smooth UI transitions and modal effects |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database for robust data integrity |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database queries and schema management |
| **Auth** | [Firebase](https://firebase.google.com/) | Anonymous Authentication provider |
----

## 🏗️ Architecture

```
wishlist-app/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   │   ├── [slug]/         # Dynamic wishlist routes
│   │   └── api/            # Backend API endpoints
│   ├── components/         # Reusable React components
│   └── lib/                # Utilities, Server Actions, Prisma client
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

*   **Node.js** (v18 or higher)
*   **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/volodyapro1337/wishlist-app.git
    cd wishlist-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory. You can duplicate `.env.example` if it exists.
    ```env
    # Database
    DATABASE_URL="postgresql://wishlist:wishlist_password@localhost:5433/wishlist_db?schema=public"

    # Firebase (Required for Auth)
    NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
    ```

### Running Locally

1.  **Run Migrations**
    Apply the database schema against your configured `DATABASE_URL`:
    ```bash
    npx prisma migrate dev
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📦 Deployment

### VPS Setup (git pull workflow)
1. На сервере должны стоять Node.js 18+, npm и PostgreSQL (настройте `DATABASE_URL` в `.env`).
2. Клонируйте проект или заходите в уже существующий:
    ```bash
    git clone https://github.com/VolodyaPro1337/Wishlist.git
    cd Wishlist
    ```
3. Создайте `.env` с ключами (Firebase, GEMINI_API_KEY, DATABASE_URL и т.д.).
4. Установите зависимости и примените миграции:
    ```bash
    npm ci
    npx prisma migrate deploy
    ```
5. Соберите и запустите (в продакшене — под pm2/systemd):
    ```bash
    npm run build
    npm run start
    ```
6. Обновления: `git pull` → `npm ci` → `npx prisma migrate deploy` → `npm run build` → перезапуск сервиса.

---

## 🔌 API Endpoints

While primarily using Server Actions, the app exposes several API routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/wishlists` | Fetch wishlists for a user |
| `POST` | `/api/ai/enrich` | AI-powered item metadata fetching |
| `POST` | `/api/auth/verify` | Verify PIN codes |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**VolodyaPro**

*   Website: [webloomy.ru](https://webloomy.ru)
*   GitHub: [@volodyapro1337](https://github.com/volodyapro1337)

---

<div align="center">
  <sub>Built with ❤️ and ☕ by VolodyaPro</sub>
</div>
