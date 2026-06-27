import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || "fallback_secret_key_12345",
        {
            expiresIn: "15m",
        }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key_12345",
        {
            expiresIn: "7d",
        }
    );
};