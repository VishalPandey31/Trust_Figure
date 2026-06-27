import Message from "../models/message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        let query = { _id: { $ne: loggedInUserId } };

        if (req.user.role === "user") {
            query.role = "admin";
        } else if (req.user.role === "admin") {
            query.role = "user";
        }

        const filteredUsers = await User.find(query).select("-password -vaultPin");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [myId, userToChatId] }
        });

        if (!conversation) {
            return res.status(200).json([]);
        }

        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        console.log(`[sendMessage] Request received for ${req.params.id}`);
        console.log(`[sendMessage] File:`, req.file ? "Present" : "None");
        console.log(`[sendMessage] Body:`, req.body);
        
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const sender = req.user._id;

        let mediaUrl = "";
        let messageType = "text";

        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer, "chat_images");
                mediaUrl = result.secure_url;
                messageType = "image";
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({ error: "Failed to upload image" });
            }
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [sender, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [sender, receiverId]
            });
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender,
            content: text || "",
            mediaUrl,
            messageType
        });

        await newMessage.save();

        conversation.lastMessage = newMessage._id;
        await conversation.save();

        const receiverSocketId = getReceiverSocketId(receiverId.toString());
        console.log(`📨 Message from ${sender} to ${receiverId} | Socket: ${receiverSocketId}`);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        } else {
            console.log(`⚠️ Receiver ${receiverId} not online`);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
