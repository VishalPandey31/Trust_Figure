import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }
        
        const result = await uploadToCloudinary(req.file.buffer, "avatars");
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: result.secure_url },
            { new: true }
        ).select("-password -vaultPin");
        
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }
        
        const user = await User.findById(req.user._id);
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }
        
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateVaultPin = async (req, res) => {
    try {
        const { oldPin, newPin } = req.body;
        
        if (!oldPin || !newPin) {
            return res.status(400).json({ message: "Both old and new PINs are required" });
        }
        
        const user = await User.findById(req.user._id);
        
        const isMatch = await bcrypt.compare(oldPin, user.vaultPin);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old PIN" });
        }
        
        user.vaultPin = await bcrypt.hash(newPin, 10);
        await user.save();
        
        res.status(200).json({ message: "Vault PIN updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
