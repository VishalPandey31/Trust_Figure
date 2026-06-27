import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
    updateAvatar,
    updatePassword,
    updateVaultPin,
    deleteAccount
} from "../controllers/user.controller.js";

const router = express.Router();

router.put("/avatar", protectRoute, upload.single("avatar"), updateAvatar);
router.put("/password", protectRoute, updatePassword);
router.put("/vault-pin", protectRoute, updateVaultPin);
router.delete("/account", protectRoute, deleteAccount);

export default router;
