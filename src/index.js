import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";

import { connectDB } from "./db.js";
import { queryWithId } from "./utils.js";
import serviceAccount from "../.firebase/adminsdk.js";

dotenv.config();

const port = process.env.PORT;
const app = express();
const { usersCollection, productsCollection, bidsCollection } =
  await connectDB();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middlewares
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Must provide a valid access token to access this resource",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const userInfo = await admin.auth().verifyIdToken(token);
    req.headers.tokenEmail = userInfo.email;
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);
    res.status(401).json({ message: "Invalid or expired access token" });
  }
};

app.use(cors());
app.use(express.json());

// Endpoints
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Smart Deals API!" });
});

// User Endpoints
app.post("/users", async (req, res) => {
  const user = req.body;
  const { email, displayName, photoURL } = user;
  const query = { email: email };
  const userExists = await usersCollection.findOne(query);

  if (userExists) {
    res.json({ message: `User with the email ${email} already exist` });
  } else {
    const insertedUser = await usersCollection.insertOne({
      email,
      displayName,
      photoURL,
    });
    res.status(201).json(insertedUser);
  }
});

// Product Endpoints
app.get("/products", async (_req, res) => {
  const cursor = productsCollection.find();
  const products = await cursor.toArray();
  res.json(products);
});

app.get("/products/latest", async (_req, res) => {
  const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
  const products = await cursor.toArray();
  res.json(products);
});

app.get("/products/bids/:id", async (req, res) => {
  const id = req.params.id;
  const query = { product: id };
  const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
  const bids = await cursor.toArray();
  res.json(bids);
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

// Bid Endpoints
app.get("/bids", verifyFirebaseToken, async (req, res) => {
  const email = req.query.email;
  const tokenEmail = req.headers.tokenEmail;
  const query = email ? { buyer_email: email } : {};
  if (tokenEmail === email) {
    const cursor = bidsCollection.find(query);
    const bids = await cursor.toArray();
    res.json(bids);
  } else {
    res.status(403).json({ message: "Forbidden access" });
  }
});

app.get("/bids/:id", async (req, res) => {
  const id = req.params.id;
  const bid = await bidsCollection.findOne(queryWithId(id));
  res.json(bid);
});

app.post("/bids", async (req, res) => {
  const bid = req.body;
  const insertedBid = await bidsCollection.insertOne(bid);
  res.status(201).json(insertedBid);
});

app.patch("/bids/:id", async (req, res) => {
  const id = req.params.id;
  const bid = req.body;
  const updatedBid = await bidsCollection.updateOne(queryWithId(id), {
    $set: bid,
  });
  res.json(updatedBid);
});

app.delete("/bids/:id", async (req, res) => {
  const id = req.params.id;
  const deletedBid = await bidsCollection.deleteOne(queryWithId(id));
  res.json(deletedBid);
});

// Server
app.listen(port, () => {
  console.log(`[server] running at http://localhost:${port}`);
});
