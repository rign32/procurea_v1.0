# Procurea - Recovered Project

## Status of Recovery
- **Backend (Cloud Functions):** ✅ Successfully recovered!
  - Source code located in `backend/`
  - Includes: NestJS application, Prisma schema, API logic, Authentication, etc.
- **Frontend (Hosting):** ❌ Not found on cloud.
  - **RECOVERY:** A new React application has been scaffolded in `frontend/` to replace the missing code.
  - It connects to the backend and supports authentication.

## How to run the Project

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   npm run start:dev
   ```
   (Server runs on http://localhost:3000)

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   (App runs on http://localhost:5173)

## Login Instructions (Development)
Since email services are not configured locally:
1. Go to `http://localhost:5173`.
2. Enter your email and click "Send Magic Code".
3. Check the **Backend Terminal** for a log line like:
   `[DEV MAGIC CODE] To: ... | Code: 123456`
4. Enter this code in the frontend to log in.

## Database
- Uses local `dev.db` (SQLite).
- If schema errors occur, run: `cd backend && npx prisma db push`.
- **Redis Fallback**: The backend is patched to work without Redis (stores codes in memory).
