# FishLink Frontend

A modern, professional frontend application for the FishLink Fresh Fish Trace Management System.

## Features

- 🔐 Authentication with OTP verification
- 👥 Role-based dashboards (Admin, Agent, Fisher, Buyer)
- 🐟 Catch management for fishers
- 🛒 Order and payment system for buyers
- 📦 Delivery tracking
- 🔍 QR code verification for traceability
- 🤖 AI-powered fish freshness detection
- 💳 Chapa payment integration

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- React Hook Form
- Lucide Icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:5000
```

## Development

The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:5000`.

