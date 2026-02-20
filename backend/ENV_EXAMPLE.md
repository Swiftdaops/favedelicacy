# Example environment variables for backend

Copy this file to `.env` in the `backend/` folder and fill in secrets locally (do NOT commit `.env`).

NODE_ENV=development
PORT=5000

NEXT_PUBLIC_API_URL=http://localhost:5000

MONGO_URI=your_mongo_uri_here

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_NAME=admin_token

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Rate limiter
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Seed admin credentials (for local dev only)
# Use these values if you want the seeded admin to match what tests expect.
SEED_ADMIN_EMAIL=favedelicacy@admin.com
SEED_ADMIN_PASSWORD=Favesellsgoodfood$15

---
# Deployment notes
# - Add the same keys to your Render/hosting environment variables.
# - Do NOT store production secrets in the repository.
