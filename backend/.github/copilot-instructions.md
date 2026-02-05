<!-- Copied/created for the backend service of the Favedelicay project -->
# Copilot / Agent Instructions — Backend

Purpose: give an AI coding agent the minimal, actionable context to be productive working on the `backend` service.

**Big picture**
- **Runtime & framework:** Node.js + ES Modules, Express server. Main entry: `src/server.js` and app wiring in `src/app.js`.
- **Persistence:** MongoDB via Mongoose. Connection helper: `src/config/db.js`.
- **Request flow:** `src/server.js` → `src/app.js` → `src/routes.js` → per-route files in `src/routes/` → controllers in `src/controllers/` → services/models in `src/services/` and `src/models/`.
- **File layout to inspect first:** `src/app.js`, `src/server.js`, `src/routes.js`, `src/controllers/*`, `src/models/*`, `src/middlewares/*`, `src/config/*`, `src/utils/*`.

**Important patterns & conventions (project-specific)**
- Controllers return async handlers wrapped with `utils/asyncHandler.js` and rely on `middlewares/error.middleware.js` for centralized errors — follow that pattern for new endpoints.
- Validation uses schema files in `src/schemas/` (Joi/Zod present in `package.json`); prefer the existing schema modules when adding routes.
- File uploads use Cloudinary: `src/config/cloudinary.js` and the `multer` + `multer-storage-cloudinary` stack via `middlewares/upload.middleware.js`.
- Auth: `middlewares/auth.middleware.js` guards protected endpoints. Token signing/verification is centralized in `src/utils/jwt.js` (uses `JWT_SECRET`).

**Dev / build / run commands**
- Install deps: `npm install` (run inside the backend folder).
- Start server (production): `npm start` → runs `node src/server.js`.
- Dev mode (auto-reload): `npm run dev` → runs `nodemon src/server.js`.
- Seed DB scripts:
  - `npm run seed:admin`
  - `npm run seed:food`
  - `npm run seed:drinks`
  - `npm run seed:all`

**Required environment variables (checked in code)**
- `MONGO_URI` (required by `src/server.js` / `src/config/db.js`)
- `JWT_SECRET` (used by `src/utils/jwt.js`)
- `JWT_EXPIRES_IN` (optional)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (used by `src/config/cloudinary.js`)
- `PORT`, `NODE_ENV` (optional)

Do NOT commit `.env` or credentials. If you need example values, add a local `.env.example` instead.

**Integration points & external services**
- MongoDB (via `MONGO_URI`).
- Cloudinary for image uploads.
- No Stripe or external payment provider code observed; payments are internal models (`src/models/payment.model.js`) and `src/services/payment.service.js` updates order statuses.

**Examples from the codebase**
- DB connect and start sequence: `src/server.js` connects via `connectDB(MONGO_URI)` then starts Express.
- Upload helper: `src/config/cloudinary.js` exposes `uploadToCloudinary(filePath, folder)` returning `{ public_id, url }`.
- JWT helpers: `src/utils/jwt.js` with `signToken(payload)` and `verifyToken(token)`.

**How to push only this backend to a new repo root**
- Initialize git inside the `backend` folder (do not push the parent folder). The project expects the repository root to contain the backend files directly.
- Keep secrets out of commits. Add/verify `.gitignore` includes `.env` before pushing.

If something in this file is unclear or you want additional examples (e.g., a short walkthrough for adding a new authenticated endpoint), tell me which area to expand.
