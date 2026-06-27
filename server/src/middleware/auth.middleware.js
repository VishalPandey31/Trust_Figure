import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute =
    async (req, res, next) => {
        try {
            const token =
                req.cookies.accessToken;

            if (!token) {
                return res.status(401).json({
                    message: "Not Authorized",
                });
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user =
                await User.findById(
                    decoded.userId
                ).select(
                    "-password -vaultPin"
                );

            next();
        } catch (error) {
            console.log(error);

            return res.status(401).json({
                message: error.message,
            });
        }
    };

export const protectAdminRoute = async (req, res, next) => {
    try {
        if (req.body && req.body.adminSecretCode) {
            if (req.body.adminSecretCode === process.env.ADMIN_SECRET) {
                return next();
            } else {
                return res.status(400).json({
                    message: "Invalid Admin Secret Code",
                });
            }
        }

        await protectRoute(req, res, () => {
            if (req.user && req.user.role === "admin") {
                next();
            } else {
                return res.status(403).json({
                    message: "Only admins can register new users without secret code",
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

