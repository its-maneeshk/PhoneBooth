import { Schema, model } from "mongoose";
import slugify from "slugify";

const ProductSchema = new Schema({
  title: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category: { type: String, enum: ["phone", "laptop"], required: true },
  images: { type: [String], default: [] }, // URLs for now
  launchDate: { type: Date, required: true },
  price: { type: Number }, // optional
  specs: { type: Schema.Types.Mixed, default: {} }, // free-form spec object
  slug: { type: String, unique: true, index: true }
}, { timestamps: true });

ProductSchema.pre("save", function(next) {
  if (!this.isModified("title")) return next();
  this.slug = slugify(`${this.title}-${this.brand}`, { lower: true, strict: true });
  next();
});

ProductSchema.virtual("status").get(function() {
  return new Date(this.launchDate) <= new Date() ? "launched" : "upcoming";
});

export default model("Product", ProductSchema);
