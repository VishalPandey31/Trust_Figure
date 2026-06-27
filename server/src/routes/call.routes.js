import express from "express";
import { saveCallHistory, getCallHistory } from "../controllers/call.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, saveCallHistory);
router.get("/", protectRoute, getCallHistory);

export default router;
