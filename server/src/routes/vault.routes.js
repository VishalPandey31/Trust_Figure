import express from "express";

import { verifyVaultPin }
    from "../controllers/vault.controller.js";

import { protectRoute }
    from "../middleware/auth.middleware.js";

import { vaultLimiter }
    from "../middleware/vaultLimiter.js";

const router = express.Router();

router.post(
    "/verify-pin",
    protectRoute,
    vaultLimiter,
    verifyVaultPin
);

export default router;