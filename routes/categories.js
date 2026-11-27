import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js"; 
import { MAX_CATEGORY_LIMIT } from "../utils/constants.js";

const router = Router();

// GET /api/categories : all ACTIVE categories, newest first.
// Optional ?limit=6 (used by the Home page).
router.get("/", async (req, res, next) => {
  try {
    const db = await getDb();

    // Only accept a whole number between 1 and MAX_CATEGORY_LIMIT
    let limit = 0;
    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > MAX_CATEGORY_LIMIT) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid limit" });
      }
    }

    // limit(0) means "no limit" in MongoDB
    const categories = await db
      .collection("categories")
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    res.json({
      success: true,
      message: "Categories loaded",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:id : one ACTIVE category (404 if missing or inactive)
router.get("/:id", async (req, res, next) => {
  try {
    // A bad id string must give 404, not crash the server
    if (!ObjectId.isValid(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const db = await getDb();
    const category = await db.collection("categories").findOne({
      _id: new ObjectId(req.params.id),
      isActive: true,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category loaded", data: category });
  } catch (error) {
    next(error);
  }
});

export default router;