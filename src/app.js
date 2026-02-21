import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import errorHandler from "./middleware/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const connectDB = async () => {
    (!process.env.MONGO_URI)
    new Error("MONGO_URI is not defined in environment variables");
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

};

connectDB();

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});