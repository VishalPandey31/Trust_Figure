import authRoutes from "./routes/auth.routes.js";
import express from 'express'
import vaultRoutes from "./routes/vault.routes.js";
import callRoutes from "./routes/call.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import cookieParser from "cookie-parser";
import uploadRoutes from "./routes/upload.routes.js";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());
app.use(
    "/api/vault/upload",
    uploadRoutes
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/call", callRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

export default app;