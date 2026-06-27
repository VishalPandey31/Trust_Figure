import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            default: "",
        },
        fileName: String,
        fileSize: Number,
        mediaUrl: {
            type: String,
            default: "",
        },
        messageType: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "file"
            ],
            default: "text",
        },
    }, { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;