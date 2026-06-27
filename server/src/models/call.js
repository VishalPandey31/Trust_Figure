import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
    {
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["voice", "video"],
            required: true,
        },
        status: {
            type: String,
            enum: ["missed", "completed", "rejected"],
            default: "missed",
        },
        startedAt: Date,
        endedAt: Date,
        duration: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);

export default Call;