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
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
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
