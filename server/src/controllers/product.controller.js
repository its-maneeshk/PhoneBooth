import Product from "../models/Product.js";

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) { next(e); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
};

export const getBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (e) { next(e); }
};

export const listProducts = async (req, res, next) => {
  try {
    const {
      category,      // phone | laptop
      status,        // upcoming | launched
      search,        // keyword in title/brand
      sort = "-launchDate",
      page = 1,
      limit = 12
    } = req.query;

    const where = {};
    if (category) where.category = category;

    if (status === "upcoming") where.launchDate = { $gt: new Date() };
    if (status === "launched") where.launchDate = { $lte: new Date() };

    if (search) {
      where.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(where).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(where)
    ]);

    res.json({
      items,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (e) { next(e); }
};
