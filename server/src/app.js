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

const allowedOrigins = [
    "http://localhost:5173",
    "https://trust-figure.surge.sh",
    "https://Trust_Figure.surge.sh",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS not allowed for: " + origin));
    },
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