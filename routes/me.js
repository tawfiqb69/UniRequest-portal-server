import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// TEMPORARY test route (step M1.13). Shows the verified user.
router.get("/", verifyToken, (req, res) => {
  res.json({ success: true, message: "Token is valid", data: req.user });
});

export default router;