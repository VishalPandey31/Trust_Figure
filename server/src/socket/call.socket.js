export const registerCallEvents = (io, socket, onlineUsers) => {
    // 📞 1. CALL USER (offer bhejna)
    socket.on("callUser", ({ to, signal, callType }) => {
        const receiverId = to.toString();
        console.log(`📞 [Socket] callUser from ${socket.userId} to ${receiverId}`);
        const receiverSocketId = onlineUsers.get(receiverId);
        console.log(`📞 [Socket] Receiver socket ID found: ${receiverSocketId}`);

        if (!receiverSocketId) {
            console.log(`📞 [Socket] Receiver ${to} is not online`);
            return;
        }

        io.to(receiverSocketId).emit("incomingCall", {
            from: socket.userId,
            signal,
            callType,
        });
        console.log(`📞 [Socket] incomingCall emitted to ${receiverSocketId}`);
    });

    // 📥 2. ANSWER CALL (receiver → caller)
    socket.on("acceptCall", ({ to, signal }) => {
        const callerId = to.toString();
        console.log(`📞 [Socket] acceptCall from ${socket.userId} to ${callerId}`);
        const callerSocketId = onlineUsers.get(callerId);

        if (!callerSocketId) return;

        io.to(callerSocketId).emit("callAccepted", {
            signal,
        });
    });

    // ❌ 3. REJECT CALL
    socket.on("rejectCall", ({ to }) => {
        const callerId = to.toString();
        console.log(`📞 [Socket] rejectCall from ${socket.userId} to ${callerId}`);
        const callerSocketId = onlineUsers.get(callerId);

        if (!callerSocketId) return;

        io.to(callerSocketId).emit("callRejected");
    });

    // 📴 4. END CALL
    socket.on("endCall", ({ to }) => {
        const otherId = to.toString();
        console.log(`📞 [Socket] endCall from ${socket.userId} to ${otherId}`);
        const otherSocketId = onlineUsers.get(otherId);

        if (!otherSocketId) return;

        io.to(otherSocketId).emit("callEnded");
    });

    // 🌐 5. ICE CANDIDATES
    socket.on("iceCandidate", ({ to, candidate }) => {
        const otherId = to.toString();
        const otherSocketId = onlineUsers.get(otherId);

        if (!otherSocketId) return;

        io.to(otherSocketId).emit("iceCandidate", {
            candidate,
        });
    });
};