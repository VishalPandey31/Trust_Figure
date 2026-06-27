import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const onlineUsers = new Map();

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    // AUTH middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("No token"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;

            next();
        } catch (err) {
            next(new Error("Auth failed"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.userId;

        onlineUsers.set(userId, socket.id);

        io.emit("getOnlineUsers", [...onlineUsers.keys()]);

        // QUICK MESSAGE
        socket.on("sendQuickMessage", ({ receiverId, message }) => {
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveQuickMessage", {
                    senderId: userId,
                    message,
                    createdAt: new Date(),
                });
            }
        });

        // TYPING
        socket.on("typing", ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", {
                    senderId: userId,
                });
            }
        });

        socket.on("stopTyping", ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStopTyping", {
                    senderId: userId,
                });
            }
        });

        // CALL SYSTEM
        socket.on("callUser", ({ receiverId, offer }) => {
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("incomingCall", {
                    senderId: userId,
                    offer,
                });
            }
        });

        socket.on("answerCall", ({ senderId, answer }) => {
            const senderSocketId = onlineUsers.get(senderId);

            if (senderSocketId) {
                io.to(senderSocketId).emit("callAccepted", {
                    answer,
                });
            }
        });

        socket.on("rejectCall", ({ senderId }) => {
            const senderSocketId = onlineUsers.get(senderId);

            if (senderSocketId) {
                io.to(senderSocketId).emit("callRejected", {
                    receiverId: userId,
                });
            }
        });

        socket.on("iceCandidate", ({ receiverId, candidate }) => {
            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("iceCandidate", {
                    candidate,
                });
            }
        });

        // DISCONNECT
        socket.on("disconnect", () => {
            onlineUsers.delete(userId);
            io.emit("getOnlineUsers", [...onlineUsers.keys()]);
        });
    });
};