import dotenv from "dotenv";

// Read the .env file (if it exists) into process.env
dotenv.config();

// One place for all settings. Other files import `env` from here.
export const env = {
  port: process.env.PORT || 5000,
  dbUri: process.env.DB_URI,
  // Default is the local Next.js address, so CORS is never open to everyone
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    imgbbApiKey: process.env.IMGBB_API_KEY,
};