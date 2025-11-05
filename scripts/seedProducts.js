const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const furnitureProducts = [
  // Sofas
  {
    name: 'Modern L-Shaped Sofa',
    description: 'Contemporary L-shaped sectional sofa with premium fabric upholstery. Wooden frame construction with plush cushioning. Perfect for spacious living rooms.',
    price: 1850.00,
    category: 'Sofas',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
  },
  {
    name: 'Classic Leather Sofa',
    description: 'Timeless 3-seater leather sofa with tufted back. Solid wood legs and genuine leather finish. Adds elegance to any room.',
    price: 2200.00,
    category: 'Sofas',
    stock: 6,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500'
  },
  {
    name: 'Scandinavian Style Sofa',
    description: 'Minimalist Scandinavian design sofa with wooden legs. Light gray fabric and clean lines. Comfortable and stylish.',
    price: 1450.00,
    category: 'Sofas',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500'
  },
  // Doors
  {
    name: 'Classic Wooden Door',
    description: 'Solid mahogany wood door with intricate carved details. Perfect for main entrances and bedroom doors. Features a rich, natural wood grain finish.',
    price: 450.00,
    category: 'Doors',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1564540574085-3b5865c8b4b6?w=500'
  },
  {
    name: 'Rustic Barn Door',
    description: 'Reclaimed wood sliding barn door with wrought iron hardware. Adds a rustic charm to any space. Easy to install with included mounting kit.',
    price: 380.00,
    category: 'Doors',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=500'
  },
  {
    name: 'French Double Doors',
    description: 'Elegant pair of French doors crafted from oak wood with glass panels. Perfect for patios and room dividers. Weather-resistant finish.',
    price: 890.00,
    category: 'Doors',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=500'
  },
  // Chairs
  {
    name: 'Executive Office Chair',
    description: 'Ergonomic wooden office chair with leather cushioning. Made from solid walnut wood with adjustable height. Combines comfort with classic style.',
    price: 320.00,
    category: 'Chairs',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500'
  },
  {
    name: 'Windsor Dining Chair',
    description: 'Traditional Windsor chair crafted from beech wood. Features spindle back design and contoured seat. Set of 4 available.',
    price: 180.00,
    category: 'Chairs',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500'
  },
  {
    name: 'Rocking Chair',
    description: 'Handcrafted wooden rocking chair made from cherry wood. Smooth rocking motion with comfortable armrests. Perfect for nurseries or living rooms.',
    price: 280.00,
    category: 'Chairs',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
  },
  {
    name: 'Kitchen Bar Stool',
    description: 'Modern wooden bar stool with footrest. Made from solid oak with natural finish. Swivel seat for easy movement.',
    price: 150.00,
    category: 'Chairs',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=500'
  },
  // Cabinets
  {
    name: 'Antique Display Cabinet',
    description: 'Vintage-style display cabinet with glass doors and shelves. Made from teak wood with brass hardware. Perfect for showcasing collectibles.',
    price: 680.00,
    category: 'Cabinets',
    stock: 6,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500'
  },
  {
    name: 'Kitchen Pantry Cabinet',
    description: 'Large wooden pantry cabinet with multiple shelves and drawers. Made from pine wood with white finish. Ample storage space.',
    price: 540.00,
    category: 'Cabinets',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=500'
  },
  {
    name: 'Bathroom Vanity Cabinet',
    description: 'Solid wood bathroom vanity with marble countertop. Includes sink and storage drawers. Water-resistant finish.',
    price: 890.00,
    category: 'Cabinets',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500'
  },
  {
    name: 'Media Storage Cabinet',
    description: 'Modern entertainment center made from walnut wood. Features cable management and adjustable shelves. Fits TVs up to 65 inches.',
    price: 720.00,
    category: 'Cabinets',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=500'
  },
  // Beds
  {
    name: 'King Size Bed Frame',
    description: 'Luxurious king-size bed frame crafted from solid oak. Features elegant headboard with carved details. Includes wooden slats for mattress support.',
    price: 1250.00,
    category: 'Beds',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500'
  },
  {
    name: 'Queen Platform Bed',
    description: 'Contemporary queen platform bed made from maple wood. Low-profile design with integrated storage drawers. No box spring required.',
    price: 890.00,
    category: 'Beds',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500'
  },
  {
    name: 'Four-Poster Bed',
    description: 'Classic four-poster bed made from mahogany wood. Grand design with tall posts and canopy frame. Available in king and queen sizes.',
    price: 1580.00,
    category: 'Beds',
    stock: 6,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500'
  },
  {
    name: 'Rustic Log Bed',
    description: 'Handcrafted log bed frame from cedar wood. Rustic cabin style with natural bark finish. Extremely sturdy construction.',
    price: 980.00,
    category: 'Beds',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500'
  },
  // Tables
  {
    name: 'Farmhouse Dining Table',
    description: 'Large farmhouse dining table made from reclaimed wood. Seats 8-10 people comfortably. Distressed finish with thick wooden top.',
    price: 1200.00,
    category: 'Tables',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500'
  },
  {
    name: 'Round Coffee Table',
    description: 'Elegant round coffee table crafted from walnut wood. Features lower shelf for storage. Perfect centerpiece for living rooms.',
    price: 380.00,
    category: 'Tables',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500'
  },
  {
    name: 'Executive Desk',
    description: 'Professional executive desk made from cherry wood. Features multiple drawers and cable management. Large work surface with leather inlay.',
    price: 1450.00,
    category: 'Tables',
    stock: 7,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500'
  },
  {
    name: 'Console Table',
    description: 'Narrow console table perfect for entryways. Made from oak wood with carved legs. Includes bottom shelf for extra storage.',
    price: 420.00,
    category: 'Tables',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=500'
  },
  {
    name: 'Bedside Nightstand',
    description: 'Compact wooden nightstand with two drawers. Made from pine wood with brushed nickel handles. Perfect beside companion.',
    price: 180.00,
    category: 'Tables',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1556228852-80a43ead7a2b?w=500'
  },
  // Wardrobes
  {
    name: 'Classic Wooden Wardrobe',
    description: 'Spacious wooden wardrobe with hanging rod and shelves. Made from solid pine with antique brass handles. Double door design.',
    price: 1350.00,
    category: 'Wardrobes',
    stock: 7,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500'
  },
  {
    name: 'Sliding Door Wardrobe',
    description: 'Modern wardrobe with sliding mirror doors. Oak wood construction with ample storage space. Perfect for bedrooms.',
    price: 1680.00,
    category: 'Wardrobes',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500'
  },
  {
    name: 'Corner Wardrobe',
    description: 'Space-saving corner wardrobe made from walnut wood. Features multiple compartments and hanging space. Ideal for small rooms.',
    price: 950.00,
    category: 'Wardrobes',
    stock: 9,
    image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?w=500'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert new furniture products
    console.log('📦 Inserting wooden furniture products...');
    const inserted = await Product.insertMany(furnitureProducts);
    console.log(`✅ Successfully added ${inserted.length} wooden furniture products`);
    
    console.log('\n📊 Product Summary:');
    console.log('   - Sofas: 3 products');
    console.log('   - Doors: 3 products');
    console.log('   - Chairs: 4 products');
    console.log('   - Cabinets: 4 products');
    console.log('   - Beds: 4 products');
    console.log('   - Tables: 5 products');
    console.log('   - Wardrobes: 3 products');

    await mongoose.connection.close();
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();