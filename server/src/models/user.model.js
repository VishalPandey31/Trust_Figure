import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        vaultPin: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: "",
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;