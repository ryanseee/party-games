# Party Games

Pixel-art multiplayer party games in an npm workspace monorepo.

## Current apps

```text
apps/
├── hub/frontend/                 # Game launcher at http://localhost:5173
└── games/who-who/
	├── frontend/                 # Who Who client at http://localhost:5101
	└── backend/                  # Express + Socket.IO server at http://localhost:5201
```

Who Who currently stores sessions and photos in memory. Restarting the backend clears active sessions.

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Install

```bash
npm install
```

## Development

Run the Hub, Who Who frontend, and Who Who backend together from this directory:

```bash
npm run dev
```

Open the Hub at <http://localhost:5173>.

The local development port convention is:

```text
5173  Hub
5101  Who Who frontend
5201  Who Who backend
```

The backend accepts `PORT` and comma-separated `CORS_ORIGIN` environment variables when these defaults need to change.

## Dokploy deployment

Deploy the three active apps as separate Dokploy services:

```text
Hub frontend       -> Dockerfile: apps/hub/frontend/Dockerfile       -> container port 80
Who Who frontend   -> Dockerfile: apps/games/who-who/frontend/Dockerfile -> container port 80
Who Who backend    -> Dockerfile: apps/games/who-who/backend/Dockerfile  -> container port 5201
```

Recommended domains:

```text
games.example.com       Hub
who-who.example.com     Who Who frontend
api.example.com          Who Who backend
```

Set these values in Dokploy:

Who Who frontend build argument:

```env
VITE_API_URL=https://api.example.com
```

Hub build argument:

```env
VITE_WHO_WHO_URL=https://who-who.example.com
```

Who Who backend runtime environment:

```env
PORT=5201
HOST=0.0.0.0
CORS_ORIGIN=https://games.example.com,https://who-who.example.com
SESSION_EXPIRY_TIME=86400000
MAX_PARTICIPANTS=50
SESSION_CODE_LENGTH=6
```

Enable WebSocket support for the backend domain because Who Who uses Socket.IO. Configure the backend health check to `GET /health`. The frontend Nginx configuration includes SPA fallback support for routes such as `/admin`, `/join`, and `/participant/...`.

To run one workspace separately:

```bash
npm run dev:hub
npm run dev:who-who-frontend
npm run dev:who-who-backend
```

## Build

Build all active apps:

```bash
npm run build
```

Build a specific workspace:

```bash
npm run build:hub
npm run build -w apps/games/who-who/frontend
npm run build -w apps/games/who-who/backend
```

## Who Who flow

1. Create a session from the Admin page.
2. Share the generated six-character code.
3. Participants join from the Hub or `/join` page.
4. The host uploads photos and assigns them automatically or manually.
5. Participants see their assigned photo in real time.
