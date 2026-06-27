import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const verifyVaultPin = async (req, res) => {
    try {

        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({
                message: "PIN is required"
            });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(
            pin,
            user.vaultPin
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid PIN"
            });
        }

        return res.status(200).json({
            vaultAccess: true
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};