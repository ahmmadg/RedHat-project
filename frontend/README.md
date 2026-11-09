# Frontend Project Structure & Architecture

A modern, responsive parcel tracking and logistics management client built with **React 19**, **Vite**, and **React Router 7**.

---

## 📁 Directory Structure

```text
frontend/
├── public/                         # Static assets served directly without bundling
│
├── src/
│   ├── app/                        # Application core setup & router
│   │   └── router.jsx              # Central router configuration with route guards
│   │
│   ├── assets/                     # Static media, SVG icons, and illustrations
│   │   ├── hero.png                # Hero illustration
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/                 # Shared, reusable presentation components
│   │   ├── layout/                 # Structural app-shell layouts
│   │   │   └── Navbar.jsx          # Top navigation bar with user profile & role badges
│   │   └── ui/                     # Design-system primitive UI elements
│   │       ├── Badge.jsx           # Status & role indicators
│   │       ├── Button.jsx          # Interactive button variants (primary, outline, ghost)
│   │       ├── Card.jsx            # Surface containers & stat cards
│   │       ├── Icons.jsx           # SVG iconography library
│   │       └── Input.jsx           # Text inputs, forms, and validation wrappers
│   │
│   ├── contexts/                   # Global React Context providers
│   │   └── AuthContext.jsx         # User session, JWT state, login/logout actions
│   │
│   ├── features/                   # Feature-based domain modules
│   │   └── auth/                   # Authentication & user workflow feature
│   │       ├── pages/              # View pages associated with authentication & role views
│   │       │   ├── DashboardPage.jsx # Dynamic role-based dashboard (Customer, Courier, Admin)
│   │       │   ├── LoginPage.jsx     # User login form & credentials authentication
│   │       │   └── RegisterPage.jsx  # New user onboarding & account creation
│   │       └── services/           # Feature-specific network requests
│   │           └── auth-service.js   # Login and registration API calls
│   │
│   ├── routes/                     # Routing middleware and route guard components
│   │   ├── ProtectedRoute.jsx      # Authentication guard (redirects unauthenticated users)
│   │   └── RoleRoute.jsx           # Authorization guard (validates user roles like ADMIN, COURIER)
│   │
│   ├── services/                   # Application-wide infrastructure services
│   │   └── api-client.js           # Central Axios instance with token interceptors
│   │
│   ├── theme/                      # Styling architecture & design tokens
│   │   └── theme.css               # Logistics theme system (colors, typography, cards, badges)
│   │
│   ├── utils/                      # Shared helper functions and formatters
│   │
│   ├── App.css                     # Root application styling
│   ├── App.jsx                     # Root component rendering AppRouter
│   ├── index.css                   # Global CSS imports & body resets
│   └── main.jsx                    # Application entry point (ReactDOM root mount)
│
├── .env                            # Environment configuration (VITE_API_URL)
├── .gitignore                      # Git ignored files & directories
├── eslint.config.js                # ESLint flat configuration
├── index.html                      # HTML template entry point
├── package.json                    # Project dependencies and script definitions
└── vite.config.js                  # Vite configuration with React plugin
```

---

## 🏛️ Architecture Overview

The frontend architecture is structured around modularity, separation of concerns, and feature encapsulation:

```text
┌────────────────────────────────────────────────────────┐
│                      Application                       │
│              (main.jsx ──► App.jsx ──► AppRouter)      │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌────────────────────────┐
│     Global State      │       │      Route Guards      │
│     (AuthContext)     │◄──────┤ (ProtectedRoute /      │
│  - Session Storage    │       │  RoleRoute)            │
│  - User & Role state  │       └───────────┬────────────┘
└───────────┬───────────┘                   │
            │                               ▼
            │                   ┌────────────────────────┐
            │                   │     Feature Pages      │
            │                   │ (Dashboard, Login,     │
            │                   │  Register)             │
            │                   └───────────┬────────────┘
            ▼                               │
┌───────────────────────┐                   ▼
│   Feature Services    │       ┌────────────────────────┐
│   (auth-service.js)   │       │   Reusable UI Layer    │
└───────────┬───────────┘       │ (Navbar, Button, Card, │
            │                   │  Badge, Input, Icons)  │
            ▼                   └────────────────────────┘
┌───────────────────────┐
│ Infrastructure Client │
│   (api-client.js)     │
│   - Axios instance    │
│   - Bearer Interceptor│
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│      Backend API      │
│ (http://localhost...) │
└───────────────────────┘
```

### 1. `app/` (Application Shell & Routing)
- **`router.jsx`**: Houses the root navigation definitions using `react-router-dom` v7. It wraps the route tree with `AuthProvider` and coordinates route protection (`ProtectedRoute`) and role restriction (`RoleRoute`).

### 2. `features/` (Feature-Driven Modules)
Organized into domain-specific modules rather than generic folders:
- **`auth/pages/`**: User-facing screens such as `LoginPage`, `RegisterPage`, and `DashboardPage`.
- **`auth/services/`**: Feature-specific endpoints (`login`, `register`).
- *Scalability*: New features (e.g. `shipments`, `tracking`, `customers`) can be added cleanly as peer directories inside `features/` with their own pages, hooks, and services.

### 3. `components/` (Presentation & Design System)
- **`layout/`**: Structural layout wrappers, such as `Navbar.jsx`, which dynamically displays the user's avatar, name, and role badge.
- **`ui/`**: Headless and styled primitive components (`Button`, `Card`, `Badge`, `Input`, `Icons`). These components accept variants, sizes, and states to keep UI code DRY.

### 4. `contexts/` (State Management)
- **`AuthContext.jsx`**: Manages global authentication state, token persistence in `sessionStorage`, logged-in user profile, and helper functions (`login`, `register`, `logout`). Exposes a custom `useAuth()` hook for components to access auth state.

### 5. `routes/` (Access Control & Guards)
- **`ProtectedRoute.jsx`**: Protects private routes. Redirects unauthenticated visitors to `/login` while preserving the intended destination path in `location.state`.
- **`RoleRoute.jsx`**: Role-Based Access Control (RBAC). Inspects the user's role against `allowedRoles` (e.g. `ADMIN`, `COURIER`). Unauthorized users are redirected safely to `/dashboard`.

### 6. `services/` (HTTP & Infrastructure)
- **`api-client.js`**: Centralized Axios instance configured with `import.meta.env.VITE_API_URL`. Includes a request interceptor that automatically attaches the JWT Bearer token from `sessionStorage` to all outbound API calls.

### 7. `theme/` (Design System & Tokens)
- **`theme.css`**: A comprehensive design system inspired by enterprise logistics platforms (e.g., Bosta & Aramex). Defines CSS variables for brand colors, status indicators (e.g., `in-transit`, `delivered`, `delayed`), card elevations, typography, and responsive grid layouts.

---

## 🔐 Route Hierarchy & Access Matrix

| Route Path | Protection | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/login` | Public | All | Sign in with email & password |
| `/register` | Public | All | Register a new account |
| `/dashboard` | Protected | Authenticated Users | Main operations dashboard (dynamically renders view by role) |
| `/courier` | Protected | `COURIER` | Dedicated courier delivery manifest & stop management |
| `/admin` | Protected | `ADMIN` | System administration & logistics analytics overview |
| `/*` | Public | All | Fallback redirect to `/dashboard` |

---

## ⚙️ Environment Variables

The frontend relies on Vite environment variables defined in `.env`:

```env
# URL pointing to the Express backend API
VITE_API_URL=http://localhost:4000/api
```

---

## 🚀 Available Scripts

In the `frontend/` directory, you can run:

```bash
# Start the Vite development server with Hot Module Replacement (HMR)
npm run dev

# Build production-ready static assets into the dist/ directory
npm run build

# Preview the local production build
npm run preview

# Lint the codebase using ESLint
npm run lint
```
