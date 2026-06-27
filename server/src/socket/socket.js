import { Server } from "socket.io";

import { registerChatEvents } from "./chat.socket.js";
import { registerVaultEvents } from "./vault.socket.js";
import { registerCallEvents } from "./call.socket.js";

const onlineUsers = new Map();
export let io;

export const getReceiverSocketId = (receiverId) => {
    return onlineUsers.get(receiverId);
};

export const initSocket = (server) => {
    const allowedOrigins = [
        "http://localhost:5173",
        "https://trust-figure.surge.sh",
        "https://Trust_Figure.surge.sh",
        process.env.CLIENT_URL,
    ].filter(Boolean);

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
        }

        io.emit("getOnlineUsers", [...onlineUsers.keys()]);

        registerChatEvents(io, socket, onlineUsers);
        registerVaultEvents(io, socket, onlineUsers);
        registerCallEvents(io, socket, onlineUsers);

        socket.on("disconnect", () => {
            if (userId) onlineUsers.delete(userId);
            io.emit("getOnlineUsers", [...onlineUsers.keys()]);
        });
    });
};
