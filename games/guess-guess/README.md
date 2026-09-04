# CaiCai - Real-time Photo Sharing Game

CaiCai is a real-time photo sharing and management application that allows users to create sessions, upload photos, and assign them to participants in a fun and interactive way.

## Features

- **Session Management**

  - Create unique 6-character session codes
  - Join sessions as participants
  - Real-time participant updates
  - Session expiry and cleanup

- **Photo Management**

  - Upload multiple photos
  - Automatic or manual photo assignment
  - Real-time photo updates
  - Remove photos

- **Real-time Communication**
  - WebSocket-based real-time updates
  - Instant participant joins/leaves
  - Live photo assignments
  - Session state synchronization

## Tech Stack

### Frontend

- React with TypeScript
- Socket.IO Client for real-time communication
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

### Backend

- Node.js with Express
- Socket.IO for WebSocket communication
- Supabase for database
- TypeScript for type safety

## Project Structure

```
.
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context providers
│   │   ├── pages/      # Page components
│   │   ├── types/      # TypeScript type definitions
│   │   └── utils/      # Utility functions
│   └── package.json
│
└── backend/           # Node.js backend server
    ├── src/
    │   ├── lib/       # Database and utility functions
    │   └── index.ts   # Main server file
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Environment Variables

#### Frontend (.env)

```
VITE_API_URL=http://localhost:3000
```

#### Backend (.env)

```
PORT=3000
CORS_ORIGIN=http://localhost:8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SESSION_EXPIRY_TIME=86400000
MAX_PARTICIPANTS=50
SESSION_CODE_LENGTH=6
```

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd cai-cai
```

2. Install dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Start the development servers

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

## Deployment

### Frontend

1. Build the frontend

```bash
cd frontend
npm run build
```

2. Deploy the built files to your hosting service

### Backend

1. Build the backend

```bash
cd backend
npm run build
```

2. Start the production server

```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
