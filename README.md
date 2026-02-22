# Anonymous Idea Wall

A full-stack app for sharing ideas anonymously.

## Setup

### Backend

1. Create a PostgreSQL database and set `DATABASE_URL`:
   ```bash
   export DATABASE_URL=postgresql://user:password@localhost:5432/idea_wall
   ```

2. Create the ideas table:
   ```sql
   CREATE TABLE ideas (
     id SERIAL PRIMARY KEY,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Install and run:
   ```bash
   cd backend && npm install && npm start
   ```

### Frontend

1. Create `.env` in the frontend folder (optional; defaults to `http://localhost:10000`):
   ```
   VITE_API_URL=http://localhost:10000
   ```

2. Install and run:
   ```bash
   cd frontend && npm install && npm run dev
   ```

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Frontend**: React, Vite, Tailwind CSS v4
