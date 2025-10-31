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
    console.log("✅ Successfully connected to MongoDB!");
    return { client, db, productsCollection };
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    throw err;
  }
};
