# Anonymous Idea Wall - Backend

## Setup

1. Create a PostgreSQL database and set the `DATABASE_URL` environment variable:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/idea_wall
   ```

2. Create the ideas table:
   ```sql
   CREATE TABLE ideas (
     id SERIAL PRIMARY KEY,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Install dependencies and run:
   ```bash
   npm install
   npm start
   ```
