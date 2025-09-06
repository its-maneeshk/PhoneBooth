import dotenv from "dotenv";
dotenv.config();
import { connect } from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await connect(MONGO_URI);
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Mongo connection error:", err);
    process.exit(1);
  }
})();
