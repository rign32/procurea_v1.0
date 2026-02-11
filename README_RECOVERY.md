# Procurea - Recovered Project

## Status of Recovery
- **Backend (Cloud Functions):** ✅ Successfully recovered!
  - Source code located in `backend/`
  - Includes: NestJS application, Prisma schema, API logic, Authentication, etc.
- **Frontend (Hosting):** ❌ Not found on cloud.
  - The Firebase Hosting project `project-c64b9be9...` has no active releases or deployed files.
  - The live URLs (`procurea.pl`, `app.procurea.pl`, etc.) are down.
  - If you have the frontend code in another repository or local backup, please restore it to a `frontend/` directory.

## How to run the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` (if exists) or create `.env` based on `backend/src/config` or `backend/app.module.ts`.
   - You will likely need:
     - `DATABASE_URL` (for Prisma)
     - `FIREBASE_CREDENTIALS` (or use default GCP identity)
     - `OPENAI_API_KEY` (if used)
4. Run the server:
   ```bash
   npm run start:dev
   ```

## Next Steps
- Review `backend/src` to understand the data model and API.
- If you need to rebuild the frontend, you can use the API definition (Swagger) at `http://localhost:3010/api/docs` (when running locally) to guide the development.
