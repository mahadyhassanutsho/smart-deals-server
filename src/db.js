import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

export const connectDB = async () => {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const db = client.db("smart_deals");
    const productsCollection = db.collection("products");
    const bidsCollection = db.collection("bids");
    console.log("[server/db] successfully connected to mongodb!");
    return { client, db, productsCollection, bidsCollection };
  } catch (err) {
    console.error("[server/db] failed to connect to mongodb:", err.message);
    throw err;
  }
};
