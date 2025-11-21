import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Static uploads folder
app.use("/uploads", express.static("uploads"));

// ✅ Routes import
import userRouter from "./routes/routes.js";

// ✅ Register routes
app.use("/api", userRouter);

export { app };
