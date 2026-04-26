

import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import dotenv from "dotenv";
import compression from "compression";

dotenv.config();

const app = express();
app.use(compression());
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))

const allowedOrigins = [
    "http://localhost:3000",
    "https://apna-zooom.vercel.app", 
    /vercel\.app$/ 
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(pattern => typeof pattern === 'string' ? pattern === origin : pattern.test(origin))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/ping", (req, res) => res.json({ message: "pong" }));

app.use("/api/v1/users", userRoutes);

// Cloud Server Optimizations
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(`${process.env.MONGO_URL}`)
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`)
        
        server.listen(app.get("port"), () => {
            console.log("LISTENING ON PORT 8000")
        });
    } catch (error) {
        console.error("CRITICAL ERROR: Could not connect to MongoDB.")
        console.error("Please check if your MONGO_URL in the .env file is correct.")
        console.error("Error details:", error.message)
        process.exit(1)
    }
}

start();