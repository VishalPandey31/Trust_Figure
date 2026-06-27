import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateToken.js";

export const register = async (req, res) => {
    try {
        const {
            fullName,
            username,
            email,
            password,
            confirmPassword,
            vaultPin,
            adminSecretCode,
        } = req.body;

        if (
            !fullName ||
            !username ||
            !email ||
            !password ||
            !confirmPassword ||
            !vaultPin
        ) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        if (!/^\d{6}$/.test(vaultPin)) {
            return res.status(400).json({
                message: "Vault PIN must be 6 digits",
            });
        }

        const existingUsername = await User.findOne({
            username,
        });

        if (existingUsername) {
            return res.status(400).json({
                message: "Username already exists",
            });
        }

        const existingEmail = await User.findOne({
            email,
        });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPin = await bcrypt.hash(vaultPin, 10);

        const role = adminSecretCode ? "admin" : "user";

        const user = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
            vaultPin: hashedPin,
            role,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const login = async (req, res) => {


    console.log("Before Access Token");
    console.log(process.env.JWT_SECRET);
    try {
        const {
            usernameOrEmail,
            password,
        } = req.body;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const user = await User.findOne({
            $or: [
                { email: usernameOrEmail },
                { username: usernameOrEmail },
            ],
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const accessToken =
            generateAccessToken(user._id);

        const refreshToken =
            generateRefreshToken(user._id);

        res.cookie(
            "accessToken",
            accessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            }
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge:
                    7 * 24 * 60 * 60 * 1000,
            }
        );

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const logout = async (
    req,
    res
) => {
    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logout successful",
    });
};

export const refreshToken = async (
    req,
    res
) => {
    try {
        const refreshToken =
            req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "No Refresh Token",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key_12345"
        );

        const accessToken =
            generateAccessToken(
                decoded.userId
            );

        res.cookie(
            "accessToken",
            accessToken,
            {
                httpOnly: true,
                sameSite: "strict",
            }
        );

        res.status(200).json({
            message: "Token Refreshed",
        });
    } catch (error) {
        res.status(401).json({
            message: "Invalid Refresh Token",
        });
    }
};
export const getMe = async (
    req,
    res
) => {
    res.status(200).json({
        user: {
            ...req.user.toObject(),
            id: req.user._id,
        }
    });
};