import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config();

const port = process.env.PORT;
const app = express();
const {} = await connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Smart Deals API!" });
});

app.listen(port, () => {
  console.log(`[server] running at http://localhost:${port}`);
});
