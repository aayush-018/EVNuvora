# ⚡ ChargeKaro

**India's EV Charging Marketplace** — *"Charge kar, tension chhod"*

ChargeKaro helps EV drivers discover compatible charging stations, book time slots, and pay securely. Charger owners can list their private or commercial chargers for shared use.

## 🏗️ Project Structure

```
EV/
├── apps/
│   ├── mobile/          # React Native + Expo mobile app
│   └── admin/           # Admin web panel (React + Vite)
├── server/              # Node.js + Express REST API
├── packages/
│   └── shared/          # Shared TypeScript types & constants
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (we use 24)
- npm 10+
- A Neon database account (free): https://neon.tech
- Google Maps API key: https://console.cloud.google.com
- Expo CLI: installed automatically

### 1. Clone and install

```bash
cd C:\Projects\EV
npm install
```

### 2. Configure environment

```bash
# Copy example env files
cp server/.env.example server/.env
cp apps/mobile/.env.example apps/mobile/.env

# Edit the .env files with your actual values
```

### 3. Set up the database

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start development

```bash
# Start both the API server and mobile app
npm run dev

# Or start them separately:
npm run server    # Backend API on port 3000
npm run mobile    # Expo dev server
```

### 5. Run tests

```bash
npm test
```

## 📱 Mobile App

Built with React Native, Expo SDK 58, Expo Router, and TypeScript.

- **Driver flow**: Discover chargers → View details → Book → Pay → Review
- **Host flow**: List charger → Set availability → Manage bookings → Track earnings

## 🖥️ Backend API

REST API at `/api/v1/` with JWT authentication, role-based authorization, and Zod validation.

## 🔐 Environment Variables

See `server/.env.example` and `apps/mobile/.env.example` for required configuration.

**⚠️ Never commit `.env` files or real credentials.**

## 📄 License

Private — All rights reserved.
