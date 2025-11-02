# FishLink Frontend

A complete React frontend application for the FishLink Fresh Fish Trace Management System, built with Vite, React, and Tailwind CSS.

## Features

- **Authentication System**
  - User registration with email verification (OTP)
  - Login with email or phone number
  - JWT-based authentication
  - Protected routes based on user roles

- **Role-Based Dashboards**
  - **Admin Dashboard**: System overview, order management, statistics
  - **Agent Dashboard**: Verify catches, register fishers
  - **Buyer Dashboard**: Browse verified catches, place orders
  - **Fisher Dashboard**: Register catches, view verification status, QR codes

- **QR Code Verification**
  - Verify fish catch authenticity using QR codes
  - Display catch details and traceability information

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Dark mode support
  - Toast notifications
  - Loading states and error handling

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **qrcode.react** - QR code generation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults work for local development):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
Frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── PrivateRoute.jsx
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/             # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── VerifyOTP.jsx
│   │   ├── QRVerify.jsx
│   │   └── dashboards/
│   │       ├── AdminDashboard.jsx
│   │       ├── AgentDashboard.jsx
│   │       ├── BuyerDashboard.jsx
│   │       └── FisherDashboard.jsx
│   ├── services/          # API services
│   │   └── api.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

The frontend communicates with the backend API through the service layer in `src/services/api.js`. All API calls use:

- Base URL: `http://localhost:5000/api` (configurable via `VITE_API_URL`)
- JWT authentication tokens stored in localStorage
- Automatic token injection via Axios interceptors

### API Endpoints Used

- **Auth**: `/api/auth/*` (register, login, verify-otp, send-otp)
- **User**: `/api/user/*` (profile, register-fisher)
- **Catch**: `/api/catch/*` (create, get, update, delete, verify)
- **Order**: `/api/order/*` (create, get, update-payment)
- **Verify**: `/api/verify` (QR code verification)
- **Delivery**: `/api/delivery/*` (create, get, update-status, assign)

## User Roles

The application supports four user roles:

1. **ADMIN**: Full system access, order management, statistics
2. **AGENT**: Verify catches, register fishers
3. **BUYER**: Browse catches, place orders
4. **FISHER**: Register catches, view verification status

## Authentication Flow

1. User registers with email, name, password, and role
2. System sends OTP to email
3. User verifies OTP on `/verify-otp` page
4. Upon successful verification, user is automatically logged in
5. User is redirected to their role-specific dashboard

## Dark Mode

The application includes dark mode support that:
- Toggles via the theme button in the Navbar
- Persists preference in localStorage
- Uses Tailwind's dark mode classes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

The project uses:
- ESLint (via Vite)
- Prettier (recommended)
- Functional components with Hooks
- Modern ES6+ syntax

## Troubleshooting

### Backend Connection Issues

If you're getting connection errors:
1. Ensure the backend is running on port 5000
2. Check `VITE_API_URL` in `.env`
3. Verify CORS is enabled on the backend

### Authentication Issues

If authentication isn't working:
1. Check browser localStorage for `token` and `user`
2. Verify JWT_SECRET matches between frontend and backend
3. Ensure cookies/localStorage isn't blocked

## License

Part of the FishLink project.



