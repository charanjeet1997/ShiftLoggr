# ShiftLoggr — Web Client

Responsive React + TypeScript front end for shift management: role-based access
(manager / employee), shift CRUD, swap requests, and GPS geofenced clock-in/out.

Built per `shiftloggr-spec.md`. The spec is written in JS/React 18; this
implementation keeps the existing **TypeScript + React 19 + Vite** scaffold.

## Stack

- Vite + React 19 + TypeScript
- React Router v6 (`src/routes`)
- Zustand for auth state (`src/store/authStore.ts`, persisted)
- TailwindCSS v3 + `tailwindcss-safe-area` (iOS notch / home bar)
- axios API client, `date-fns`, `lucide-react` icons

## Running

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
```

### Demo accounts (mock mode)

| Role     | Email                      | Password   |
|----------|----------------------------|------------|
| Manager  | `manager@shiftloggr.dev`   | `password` |
| Employee | `employee@shiftloggr.dev`  | `password` |

## Mock API ↔ real backend

The app ships with a **mock backend** so it runs with no server. It implements
every endpoint from the spec in-memory and persists to `localStorage`
(`src/api/mock/`). The geofence check uses the same Haversine formula the server
will (`src/utils/geoDistance.ts`).

Toggle in `.env`:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK_API=true     # set to false once the Express backend is up
```

Each module in `src/api/*.ts` branches on `USE_MOCK`: mock call vs. real
`http` (axios) request. When the backend is ready, flip the flag — no component
changes needed. The real backend must expose the routes in the spec **plus**
`GET /api/shifts/swappable` (other employees' upcoming shifts, used by the
employee swap form).

To reset mock data, run `resetMockDB()` (exported from `src/api/mock/backend.ts`)
or clear the `shiftloggr.*` keys in localStorage.

## Layout

`src/components/layout/AppShell.tsx` switches nav by breakpoint:
fixed sidebar at `lg+`, sticky mobile header + bottom tab bar below.
`useBreakpoint()` returns `{ isMobile, isTablet, isDesktop }` for view switching
(e.g. Schedule: weekly grid on desktop, date-grouped list on mobile).

## Structure

```
src/
├── api/            # auth, shifts, swaps, clock, locations, users (+ mock/)
├── components/
│   ├── ui/         # Button, Badge, Input, Select, Modal, Layout helpers
│   ├── layout/     # AppShell, Sidebar, BottomTabBar, MobileHeader, navConfig
│   ├── ShiftCard, SwapRequestCard, GeofenceStatus
├── hooks/          # useAuth, useBreakpoint, useGeofence, useShifts, useSwaps, useReferenceData
├── pages/          # Login, manager/*, employee/*
├── routes/         # AppRouter, ProtectedRoute (role guards)
├── store/          # authStore (zustand)
├── types/          # shared domain types (mirror Firestore collections)
└── utils/          # geoDistance, formatShift, cn
```
