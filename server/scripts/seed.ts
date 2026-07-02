import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set in .env.local");

const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", new mongoose.Schema({
  name: String, address: String, phone: String, logoUrl: String, tagline: String,
  active: { type: Boolean, default: true },
}, { timestamps: true }));

const Staff = mongoose.models.Staff || mongoose.model("Staff", new mongoose.Schema({
  name: String, email: { type: String, unique: true }, passwordHash: String,
  role: { type: String, enum: ["SUPERADMIN", "ADMIN", "KITCHEN"] },
  restaurantId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true }));

const Table = mongoose.models.Table || mongoose.model("Table", new mongoose.Schema({
  tableNumber: String, token: { type: String, unique: true },
  restaurantId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true }));

const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({
  name: String, position: Number, icon: String, restaurantId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true }));

const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", new mongoose.Schema({
  name: String, description: String, price: Number, imageUrl: String,
  available: { type: Boolean, default: true }, badge: String,
  categoryId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true }));

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;
  const cols = await db.listCollections().toArray();
  await Promise.all(cols.map((c) => db.dropCollection(c.name)));
  console.log("Cleared collections");

  const restaurant = await Restaurant.create({
    name: "The Grand Terrace",
    address: "5th Floor, Skyline Tower, Colombo 03",
    phone: "+94 11 234 5678",
    tagline: "Fine dining with a view",
  });

  // Super Admin (platform owner — no restaurantId)
  await Staff.create({
    name: "Super Admin",
    email: "super@platform.test",
    passwordHash: await bcrypt.hash("super123", 10),
    role: "SUPERADMIN",
  });

  await Staff.create([
    {
      name: "Admin User",
      email: "admin@seaside.test",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      restaurantId: restaurant._id,
    },
    {
      name: "Kitchen Team",
      email: "kitchen@seaside.test",
      passwordHash: await bcrypt.hash("kitchen123", 10),
      role: "KITCHEN",
      restaurantId: restaurant._id,
    },
  ]);

  const tables = await Table.create(
    ["1", "2", "3", "4", "5", "6", "7", "8"].map((n) => ({
      tableNumber: n,
      token: randomUUID(),
      restaurantId: restaurant._id,
    }))
  );

  const starters = await Category.create({ name: "Starters", icon: "🥗", position: 0, restaurantId: restaurant._id });
  const soup     = await Category.create({ name: "Soups", icon: "🍜", position: 1, restaurantId: restaurant._id });
  const mains    = await Category.create({ name: "Mains", icon: "🍖", position: 2, restaurantId: restaurant._id });
  const seafood  = await Category.create({ name: "Seafood", icon: "🦞", position: 3, restaurantId: restaurant._id });
  const pizza    = await Category.create({ name: "Pizza & Pasta", icon: "🍕", position: 4, restaurantId: restaurant._id });
  const desserts = await Category.create({ name: "Desserts", icon: "🍰", position: 5, restaurantId: restaurant._id });
  const drinks   = await Category.create({ name: "Beverages", icon: "🥤", position: 6, restaurantId: restaurant._id });
  const cocktails = await Category.create({ name: "Cocktails", icon: "🍹", position: 7, restaurantId: restaurant._id });

  await MenuItem.create([
    // Starters
    {
      name: "Bruschetta al Pomodoro",
      description: "Toasted sourdough topped with vine-ripened tomatoes, fresh basil, garlic, and a drizzle of extra virgin olive oil",
      price: 12.50,
      imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop",
      badge: "Chef's Pick",
      categoryId: starters._id,
    },
    {
      name: "Crispy Calamari",
      description: "Lightly breaded rings of fresh squid, fried golden, served with lemon aioli and marinara sauce",
      price: 16.00,
      imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
      categoryId: starters._id,
    },
    {
      name: "Burrata & Prosciutto",
      description: "Creamy Italian burrata with aged prosciutto, heirloom tomatoes, and basil oil",
      price: 18.50,
      imageUrl: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&h=300&fit=crop",
      badge: "New",
      categoryId: starters._id,
    },
    {
      name: "Chicken Satay Skewers",
      description: "Marinated chicken skewers grilled over charcoal, served with peanut sauce and cucumber relish",
      price: 14.00,
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      categoryId: starters._id,
    },

    // Soups
    {
      name: "French Onion Soup",
      description: "Classic caramelised onion broth topped with a toasted crouton and melted Gruyère cheese",
      price: 13.00,
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
      categoryId: soup._id,
    },
    {
      name: "Tom Yum Goong",
      description: "Aromatic Thai prawn soup with lemongrass, kaffir lime, galangal, and coconut milk",
      price: 14.50,
      imageUrl: "https://images.unsplash.com/photo-1569562741928-f49f9e8b74a7?w=400&h=300&fit=crop",
      badge: "Spicy",
      categoryId: soup._id,
    },
    {
      name: "Cream of Mushroom",
      description: "Wild porcini and button mushrooms blended with cream and thyme, served with crusty bread",
      price: 11.50,
      imageUrl: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=300&fit=crop",
      categoryId: soup._id,
    },

    // Mains
    {
      name: "Prime Ribeye Steak 300g",
      description: "Dry-aged 300g ribeye grilled to perfection, served with truffle mashed potato, seasonal vegetables and red wine jus",
      price: 48.00,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7b53e?w=400&h=300&fit=crop",
      badge: "Signature",
      categoryId: mains._id,
    },
    {
      name: "Roast Chicken Supreme",
      description: "Free-range chicken breast with crispy skin, herb jus, roasted garlic potatoes and seasonal greens",
      price: 28.00,
      imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=400&h=300&fit=crop",
      categoryId: mains._id,
    },
    {
      name: "Lamb Rack Provençal",
      description: "Herb-crusted New Zealand lamb rack, ratatouille, rosemary jus and pommes dauphinoise",
      price: 42.00,
      imageUrl: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=400&h=300&fit=crop",
      badge: "Chef's Pick",
      categoryId: mains._id,
    },
    {
      name: "Mushroom Wellington",
      description: "Portobello mushroom & spinach duxelles wrapped in golden puff pastry, red wine reduction, seasonal vegetables",
      price: 26.00,
      imageUrl: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
      badge: "Vegan",
      categoryId: mains._id,
    },

    // Seafood
    {
      name: "Grilled Atlantic Salmon",
      description: "Scottish salmon fillet, lemon butter sauce, asparagus, capers and dill cream potatoes",
      price: 32.00,
      imageUrl: "https://images.unsplash.com/photo-1519708227418-a8d869a68bfd?w=400&h=300&fit=crop",
      categoryId: seafood._id,
    },
    {
      name: "Lobster Thermidor",
      description: "Half Boston lobster in cognac cream sauce, gratinated with Gruyère, served with sautéed potatoes",
      price: 58.00,
      imageUrl: "https://images.unsplash.com/photo-1559742811-822873691df8?w=400&h=300&fit=crop",
      badge: "Premium",
      categoryId: seafood._id,
    },
    {
      name: "Prawn & Scallop Linguine",
      description: "Tiger prawns and pan-seared scallops with linguine, white wine, garlic, chilli and cherry tomatoes",
      price: 34.00,
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91798d4537?w=400&h=300&fit=crop",
      badge: "Popular",
      categoryId: seafood._id,
    },
    {
      name: "Sea Bass en Papillote",
      description: "Whole sea bass baked in parchment with fennel, olives, capers, lemon and herbs",
      price: 36.00,
      imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop",
      categoryId: seafood._id,
    },

    // Pizza & Pasta
    {
      name: "Margherita Napoletana",
      description: "San Marzano tomato, fior di latte mozzarella, fresh basil, extra virgin olive oil — baked in wood-fired oven",
      price: 18.00,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
      categoryId: pizza._id,
    },
    {
      name: "Truffle & Mushroom Pizza",
      description: "White truffle oil base, mixed wild mushrooms, taleggio, thyme, arugula and shaved parmesan",
      price: 24.00,
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
      badge: "Chef's Pick",
      categoryId: pizza._id,
    },
    {
      name: "Spaghetti Carbonara",
      description: "Classic Roman pasta with guanciale, egg yolk, Pecorino Romano, and cracked black pepper",
      price: 21.00,
      imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
      categoryId: pizza._id,
    },
    {
      name: "Penne Arrabbiata",
      description: "Penne pasta in a fiery tomato sauce with garlic, red chilli, fresh basil and Pecorino",
      price: 17.00,
      imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
      badge: "Spicy",
      categoryId: pizza._id,
    },

    // Desserts
    {
      name: "Classic Crème Brûlée",
      description: "Silky vanilla custard with a caramelised sugar crust, served with fresh berries",
      price: 13.00,
      imageUrl: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop",
      badge: "Popular",
      categoryId: desserts._id,
    },
    {
      name: "Chocolate Fondant",
      description: "Warm dark chocolate lava cake with a molten centre, served with Madagascar vanilla ice cream",
      price: 14.50,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
      badge: "Must Try",
      categoryId: desserts._id,
    },
    {
      name: "Tiramisu",
      description: "House-made Italian classic with espresso-soaked ladyfingers, mascarpone cream and cocoa",
      price: 13.00,
      imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
      categoryId: desserts._id,
    },
    {
      name: "Mango Panna Cotta",
      description: "Coconut panna cotta with fresh mango coulis, passionfruit and toasted coconut flakes",
      price: 12.00,
      imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
      categoryId: desserts._id,
    },

    // Beverages
    {
      name: "Freshly Squeezed Orange Juice",
      description: "Cold-pressed Valencia oranges, served chilled",
      price: 7.00,
      imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
      categoryId: drinks._id,
    },
    {
      name: "Sparkling Water 500ml",
      description: "San Pellegrino imported Italian sparkling mineral water",
      price: 5.00,
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop",
      categoryId: drinks._id,
    },
    {
      name: "Iced Specialty Coffee",
      description: "Double-shot espresso over ice with your choice of milk, vanilla or caramel syrup",
      price: 8.50,
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
      categoryId: drinks._id,
    },
    {
      name: "Fresh Mint Lemonade",
      description: "House-made lemonade with fresh mint, honey and a hint of ginger",
      price: 7.50,
      imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop",
      categoryId: drinks._id,
    },
    {
      name: "Masala Chai",
      description: "Spiced Indian tea with cardamom, cinnamon, ginger, cloves and steamed milk",
      price: 6.00,
      imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
      categoryId: drinks._id,
    },

    // Cocktails
    {
      name: "Terrace Signature Spritz",
      description: "Aperol, prosecco, fresh orange, soda water and orange bitters — our house favourite",
      price: 16.00,
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop",
      badge: "Signature",
      categoryId: cocktails._id,
    },
    {
      name: "Classic Mojito",
      description: "White rum, fresh lime, mint leaves, cane sugar and soda water",
      price: 15.00,
      imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=300&fit=crop",
      categoryId: cocktails._id,
    },
    {
      name: "Passion Fruit Martini",
      description: "Absolut Vanilla, passion fruit liqueur, pineapple juice and a prosecco shot on the side",
      price: 17.00,
      imageUrl: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=400&h=300&fit=crop",
      badge: "Popular",
      categoryId: cocktails._id,
    },
    {
      name: "Old Fashioned",
      description: "Bourbon whiskey, Angostura bitters, demerara sugar, expressed orange peel",
      price: 18.00,
      imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop",
      categoryId: cocktails._id,
    },
  ]);

  console.log("\n✅ Seeded: The Grand Terrace");
  console.log("Super Admin:   super@platform.test / super123");
  console.log("Admin login:   admin@seaside.test  / admin123");
  console.log("Kitchen login: kitchen@seaside.test / kitchen123");
  console.log("\nTable QR URLs:");
  (tables as { tableNumber: string; token: string }[]).forEach((t) =>
    console.log(`  Table ${t.tableNumber} → /menu/${t.token}`)
  );

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
