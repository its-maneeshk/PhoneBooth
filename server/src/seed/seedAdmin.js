import dotenv from "dotenv";
dotenv.config();
import { connect, disconnect } from "mongoose";
import User from "../models/User.js";

const run = async () => {
  await connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin exists:", email);
  } else {
    await User.create({ email, password });
    console.log("Created admin:", email);
  }
  await disconnect();
};
run().catch(e => { console.error(e); process.exit(1); });
