import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";
import { env } from "../config/env.js";
import { MAX_FILE_SIZE_BYTES } from "../utils/constants.js";

const router = Router();

// Keep the file in memory (we send it straight to ImgBB, nothing is saved on our disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

// Check the first bytes of the file. We never trust the type sent by the browser.
const hasImageSignature = (buffer) => {
  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  return isJpg || isPng;
};

// Run multer and turn its errors into clear messages
const readFile = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ success: false, message: "Image must be 5 MB or smaller" });
      }
      return res.status(400).json({ success: false, message: "Invalid upload" });
    }
    if (error) {
      return next(error);
    }
    next();
  });
};

// POST /api/upload-photo  (form field name: image)
router.post("/", verifyToken, readFile, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please choose an image" });
  }

  if (!hasImageSignature(req.file.buffer)) {
    return res.status(400).json({ success: false, message: "Only JPG or PNG images are allowed" });
  }

  if (!env.imgbbApiKey) {
    return res.status(500).json({ success: false, message: "Photo upload is not configured" });
  }

  // Send the image to ImgBB. The API key stays on the server.
  const formData = new FormData();
  formData.append("key", env.imgbbApiKey);
  formData.append("image", new Blob([req.file.buffer]), "photo");

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.data?.url) {
    return res.status(502).json({ success: false, message: "Photo upload failed. Please try again." });
  }

  res.json({ success: true, message: "Photo uploaded", data: { url: result.data.url } });
});

export default router;