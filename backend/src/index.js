import express from "express";
import cors from "cors";
import path from "path";
import userRouters from "./routes/auth.route.js"
import messageRouters from "./routes/message.route.js"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { ConnectDB } from "./lib/db.js";
import { app, server } from "./lib/Socket.js";
dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();



app.use(express.json({ limit: "10mb" })); // Increase the limit to 10MB
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // For URL-encoded data
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))


app.use("/api/auth", userRouters);
app.use("/api/messages", messageRouters);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


server.listen(PORT, () => {
    console.log(`backend server running on port:${PORT}`);
    ConnectDB();
})