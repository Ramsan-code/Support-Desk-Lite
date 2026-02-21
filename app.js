// console.log("test");
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json());
const connectDB = async () => {
     mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        };

connectDB();

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});