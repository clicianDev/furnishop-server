require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const sampleProducts = [
  {
    name: "Modern Cabinet Collection",
    description:
      "Beautiful wooden cabinet collection with multiple style variants",
    price: 15000,
    category: "Cabinets",
    stock: 10,
    image: "/models/cabinet/images/image-1.jpg",
    models: [
      {
        modelUrl: "/models/cabinet/cabinet-1.glb",
        price: 15000,
        description:
          "This cabinet has two openings and a classic design, perfect for storing clothes and pants.",
        variantName: "Clothing Cabinet",
      },
      {
        modelUrl: "/models/cabinet/cabinet-2.glb",
        price: 18000,
        description:
          "This cabinet features a top section for storing plates and a lower section for general storage.",
        variantName: "Dual Storage Cabinet",
      },
      {
        modelUrl: "/models/cabinet/cabinet-3.glb",
        price: 20000,
        description:
          "This cabinet includes an upper section for plates protected by glass to prevent dust and insects, and a lower section for additional storage.",
        variantName: "Glass-Protected Cabinet",
      },
    ],
  },
  {
    name: "Outdoor Table Series",
    description: "Premium table collection with 2 functional designs.",
    price: 12000,
    category: "Tables",
    stock: 15,
    image: "/models/table/images/image-1.png",
    models: [
      {
        modelUrl: "/models/table/table-2.glb",
        price: 15000,
        description:
          "This is a standard dining table with a simple, elegant design ideal for everyday use.",
        variantName: "Standard Dining Table",
      },
      {
        modelUrl: "/models/table/table-1.glb",
        price: 12000,
        description:
          "This table includes built-in seating, making it perfect for compact dining spaces or casual setups.",
        variantName: "Built-In Seating Table",
      },
    ],
  },
  {
    name: "Compact Mini Cabinet",
    description: "Space-saving mini cabinet perfect for small spaces.",
    price: 3000,
    category: "Cabinets",
    stock: 20,
    image: "/models/mini-cabinet/images/image-1.png",
    models: [
      {
        modelUrl: "/models/mini-cabinet/mini-cabinet-1.glb",
        price: 8000,
        description:
          "Compact cabinet design perfect for apartments and small offices. Features 2 openings with 2 shelves inside.",
        variantName: "Two-Door Mini Cabinet",
      },
    ],
  },
  {
    name: "Work Table",
    description: "Professional work table for office and study",
    price: 3500,
    category: "Tables",
    stock: 12,
    image: "/models/work-table/images/image-1.png",
    models: [
      {
        modelUrl: "/models/work-table/work-table-1.glb",
        price: 10000,
        description:
          "Professional work desk with spacious surface area and cable management. Ideal for home offices.",
        variantName: "Standard Desk",
      },
    ],
  },
  {
    name: "Modern Shelf Unit",
    description:
      "Contemporary shelf designs for displaying and organizing items.",
    price: 2000,
    category: "Cabinets",
    stock: 25,
    image: "/models/shelf/images/image-1.png",
    models: [
      {
        modelUrl: "/models/shelf/shelf-1.glb",
        price: 6000,
        description:
          "A large shelf unit that provides ample space for books, plants, and decorative items.",
        variantName: "Large Display Shelf",
      },
      {
        modelUrl: "/models/shelf/shelf-2.glb",
        price: 7000,
        description:
          "A compact single-frame shelf designed to fit smaller spaces while maintaining modern style.",
        variantName: "Compact Shelf",
      },
      {
        modelUrl: "/models/shelf/shelf-3.glb",
        price: 8000,
        description:
          "A corner shelf perfect for placing in the corners of your home, ideal for maximizing space and style.",
        variantName: "Corner Shelf",
      },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log("Sample products with models added successfully!");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
