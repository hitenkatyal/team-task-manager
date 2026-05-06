# Team Task Manager

A full-stack team task management application built with React, Express, and LibSQL.

## Features

- User authentication (login/register)
- Dashboard with project overview
- Project management
- Task tracking
- User management
- Responsive UI

## Tech Stack

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express.js
- **Database**: SQLite (@libsql/client)
- **Auth**: JWT + bcrypt
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/team-task-manager.git
   cd team-task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key_here
   LIBSQL_DATABASE_URL=file:data/taskmanager.db
   LIBSQL_CLIENT_SECRET=your_libsql_token_here
   ```

4. Start the backend:
   ```bash
   npm start
   ```

5. Start the frontend (in another terminal):
   ```bash
   cd client && npm run dev
   ```

6. Open http://localhost:5173 in your browser.

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/users` - Get all users

## Project Structure

```
team-task-manager/
├── client/          # React frontend
├── server/          # Express backend
│   ├── routes/      # API routes
│   ├── middleware/  # Auth middleware
│   └── db.js        # Database connection
├── data/            # Database files
└── package.json     # Root dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License