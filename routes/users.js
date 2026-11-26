import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getDb } from "../config/db.js";

const router = Router();

// Short helper for sending a 400 error
const badRequest = (res, message) => {
  return res.status(400).json({ success: false, message });
};

// PATCH /api/users/profile
// Only these fields can change: name, phone, department, universityId, image.
// role and email in the body are ignored. The user is found by the verified token's email.
router.patch("/profile", verifyToken, async (req, res) => {
  const body = req.body || {};
  const updates = {};

  if ("name" in body) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2 || name.length > 100) {
      return badRequest(res, "Name must be 2 to 100 characters");
    }
    updates.name = name;
  }

  if ("phone" in body) {
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    if (phone === null || phone.length > 20 || !/^[0-9+\-\s()]*$/.test(phone)) {
      return badRequest(res, "Phone can have only numbers, +, -, spaces and brackets (max 20)");
    }
    updates.phone = phone;
  }

  if ("department" in body) {
    const department = typeof body.department === "string" ? body.department.trim() : null;
    if (department === null || department.length > 100) {
      return badRequest(res, "Department must be 100 characters or less");
    }
    updates.department = department;
  }

  if ("universityId" in body) {
    const universityId = typeof body.universityId === "string" ? body.universityId.trim() : null;
    if (universityId === null || universityId.length > 30) {
      return badRequest(res, "ID must be 30 characters or less");
    }
    updates.universityId = universityId;
  }

  if ("image" in body) {
    if (typeof body.image !== "string" || body.image.length > 500 || !/^https:\/\/\S+$/.test(body.image)) {
      return badRequest(res, "Invalid image link");
    }
    updates.image = body.image;
  }

  if (Object.keys(updates).length === 0) {
    return badRequest(res, "Nothing to update");
  }

  updates.updatedAt = new Date();

  const db = await getDb();
  await db.collection("users").updateOne({ email: req.user.email }, { $set: updates });

  const user = await db.collection("users").findOne({ email: req.user.email });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      name: user.name,
      email: user.email,
      image: user.image || "",
      role: user.role,
      phone: user.phone || "",
      department: user.department || "",
      universityId: user.universityId || "",
    },
  });
});

export default router;