import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";
import { getDb } from "../config/db.js";

// Public keys come from the client website (Better Auth). jose keeps them cached.
const JWKS = createRemoteJWKSet(new URL(`${env.clientUrl}/api/auth/jwks`));

// Sends the same error shape everywhere
const unauthorized = (res, message) => {
  return res.status(401).json({ success: false, message });
};

export const verifyToken = async (req, res, next) => {
  // 1. The request must have "Authorization: Bearer <token>"
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return unauthorized(res, "Authorization token is missing");
  }
  const token = header.slice(7);

  // 2. Check the token signature, issuer, audience and expiry
  let payload;
  try {
    const result = await jwtVerify(token, JWKS, {
      issuer: env.clientUrl,
      audience: env.clientUrl,
    });
    payload = result.payload;
  } catch (error) {
    return unauthorized(res, "Invalid or expired token");
  }

  if (!payload.email) {
    return unauthorized(res, "Invalid token data");
  }

  // 3. Load the user's CURRENT data from the database.
  // We trust the database for the role, not the token, so role changes work at once.
  const db = await getDb();
  const user = await db.collection("users").findOne({ email: payload.email });

  if (!user) {
    return unauthorized(res, "User not found");
  }

  // 4. Save the verified user on the request for the next middleware or route
  req.user = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department || "",
    universityId: user.universityId || "",
  };

  next();
};