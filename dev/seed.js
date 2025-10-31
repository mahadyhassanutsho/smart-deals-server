import { connectDB } from "../src/db.js";
import { faker } from "@faker-js/faker";

(async () => {
  const { productsCollection, bidsCollection } = await connectDB();

  // Clear existing data
  await productsCollection.deleteMany({});
  await bidsCollection.deleteMany({});
  console.log("✅ Cleared existing products and bids");

  // Categories and conditions
  const categories = [
    "Electronics",
    "Furniture",
    "Books",
    "Clothing",
    "Appliances",
  ];
  const conditions = ["fresh", "used"];
  const products = [];

  for (let i = 0; i < 10; i++) {
    products.push({
      title: faker.commerce.productName(),
      price_min: faker.number.int({ min: 10, max: 100 }),
      price_max: faker.number.int({ min: 101, max: 1000 }),
      email: faker.internet.email(),
      category: faker.helpers.arrayElement(categories),
      created_at: faker.date.recent({ days: 30 }),
      image: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
      status: faker.helpers.arrayElement(["pending", "sold"]),
      location: faker.location.city(),
      seller_image: faker.image.avatar(),
      seller_name: faker.person.fullName(),
      condition: faker.helpers.arrayElement(conditions),
      usage: `${faker.number.int({ min: 1, max: 36 })} months old`,
      description: faker.lorem.paragraph(),
      seller_contact: faker.phone.number(),
    });
  }

  const insertedProducts = await productsCollection.insertMany(products);
  console.log(`✅ Inserted ${insertedProducts.insertedCount} products`);

  // Generate bids linked to products
  const bids = [];
  const productIds = Object.values(insertedProducts.insertedIds);

  for (let i = 0; i < 20; i++) {
    const productId = faker.helpers.arrayElement(productIds);
    bids.push({
      product: productId,
      buyer_image: faker.image.avatar(),
      buyer_name: faker.person.fullName(),
      buyer_contact: faker.phone.number(),
      buyer_email: faker.internet.email(),
      bid_price: faker.number.int({ min: 20, max: 1200 }),
      status: faker.helpers.arrayElement(["pending", "confirmed"]),
    });
  }

  const insertedBids = await bidsCollection.insertMany(bids);
  console.log(`✅ Inserted ${insertedBids.insertedCount} bids`);

  process.exit(0);
})();
