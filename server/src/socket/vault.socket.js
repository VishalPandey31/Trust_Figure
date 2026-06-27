export const registerVaultEvents = (io, socket, onlineUsers) => {
    const userId = socket.userId;

    socket.on("sendVaultMessage", ({ receiverId, message }) => {
        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveVaultMessage", {
                senderId: userId,
                message,
                createdAt: new Date()
            });
        }
    });
};