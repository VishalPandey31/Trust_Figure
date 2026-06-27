import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace("/api", "") 
    : "https://trust-figure.onrender.com";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

// After connecting, emit register event so server maps userId -> socketId
socket.on("connect", () => {
    console.log("🟢 Socket Connected:", socket.id);
    const userId = socket.io.opts.query?.userId;
    if (userId) {
        socket.emit("register", { userId });
    }
});

socket.on("disconnect", () => {
    console.log("🔴 Socket Disconnected");
});

export default socket;