export const registerChatEvents = (io, socket, onlineUsers) => {
    // Reliable registration via event (in case query didn't arrive)
    socket.on("register", ({ userId: uid }) => {
        if (uid) {
            // Remove old socket for this user if any
            for (const [key, val] of onlineUsers.entries()) {
                if (val === socket.id && key !== uid) onlineUsers.delete(key);
            }
            onlineUsers.set(uid, socket.id);
            socket.userId = uid;
            console.log(`✅ User registered via event: ${uid} → ${socket.id}`);
            io.emit("getOnlineUsers", [...onlineUsers.keys()]);
        }
    });

    socket.on("sendQuickMessage", ({ receiverId, message }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveQuickMessage", {
                senderId: socket.userId,
                message,
                createdAt: new Date()
            });
        }
    });

    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", {
                senderId: socket.userId
            });
        }
    });

    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStopTyping", {
                senderId: socket.userId
            });
        }
    });
};