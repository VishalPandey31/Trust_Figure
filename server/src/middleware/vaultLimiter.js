import rateLimit from "express-rate-limit";

export const vaultLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        message: "Too many PIN attempts. Try again later."
    }
});