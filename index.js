import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { queryWithId } from "./utils.js";

dotenv.config();

const port = process.env.PORT;
const app = express();
const { productsCollection } = await connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Smart Deals API!" });
});

app.get("/products", async (_req, res) => {
  const cursor = productsCollection.find();
  const products = await cursor.toArray();
  res.json(products);
});

app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  const product = await productsCollection.findOne(queryWithId(id));
  res.json(product);
});

app.post("/products", async (req, res) => {
  const product = req.body;
  const insertedProduct = await productsCollection.insertOne(product);
  res.status(201).json(insertedProduct);
});

app.patch("/products/:id", async (req, res) => {
  const id = req.params.id;
  const product = req.body;
  const updatedProduct = await productsCollection.updateOne(queryWithId(id), {
    $set: product,
  });
  res.json(updatedProduct);
});

app.delete("/products/:id", async (req, res) => {
  const id = req.params.id;
  const deletedProduct = await productsCollection.deleteOne(queryWithId(id));
  res.json(deletedProduct);
});

app.listen(port, () => {
  console.log(`[server] running at http://localhost:${port}`);
});
