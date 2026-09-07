const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Models
const Users = require("./src/models/users");
const Organizations = require("./src/models/organizations");

// Load env
dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Create a dummy organization
    let org = await Organizations.findOne({ domain: "festifyedu.com" });
    if (!org) {
      org = await Organizations.create({
        organization_name: "FestifyEdu Central",
        address: "123 Education Lane",
        city: "London",
        postcode: "E1 6AN",
        country: "UK",
        domain: "festifyedu.com",
        subscription_status: "active",
      });
      console.log("Created dummy organization.");
    }

    // 2. Hash default password
    const password = await bcrypt.hash("password123", 10);

    // 3. Define the 3 users
    const usersToSeed = [
      {
        name: "Super Admin User",
        email: "superadmin@festifyedu.com",
        password,
        role: "super_admin",
        organization_id: org._id,
      },
    ];

    for (const user of usersToSeed) {
      const exists = await Users.findOne({ email: user.email });
      if (!exists) {
        await Users.create(user);
        console.log(`Created ${user.role} with email ${user.email}`);
      } else {
        console.log(`User ${user.email} already exists. Skipping.`);
      }
    }

    console.log("\nDatabase seeded successfully!");
    console.log("Use the password: password123 to log in.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
