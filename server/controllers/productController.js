const Product = require("../models/Product");

// GET all products with search & filter
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category && category !== "all") {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name color")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    const allProducts = await Product.find(query);
    const totalAmount = allProducts.reduce((sum, p) => sum + p.amount, 0);
    const totalQuantity = allProducts.reduce((sum, p) => sum + p.quantity, 0);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      summary: { totalAmount, totalQuantity, totalProducts: total },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name color",
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create product
exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    const price = parseFloat(productData.price);
    const quantity = parseInt(productData.quantity);
    if (isNaN(price) || price < 0)
      return res
        .status(400)
        .json({ success: false, message: "Price must be 0 or greater" });
    if (isNaN(quantity) || quantity < 0)
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be 0 or greater" });

    // Convert uploaded file to base64 and save in MongoDB
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      productData.image = `data:${req.file.mimetype};base64,${b64}`;
    }

    productData.amount = price * quantity;

    const product = new Product(productData);
    await product.save();
    await product.populate("category", "name color");
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT update product
exports.updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const updateData = { ...req.body };

    if (updateData.price !== undefined) {
      const price = parseFloat(updateData.price);
      if (isNaN(price) || price < 0)
        return res
          .status(400)
          .json({ success: false, message: "Price must be 0 or greater" });
    }
    if (updateData.quantity !== undefined) {
      const quantity = parseInt(updateData.quantity);
      if (isNaN(quantity) || quantity < 0)
        return res
          .status(400)
          .json({ success: false, message: "Quantity must be 0 or greater" });
    }

    // Convert new uploaded file to base64
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      updateData.image = `data:${req.file.mimetype};base64,${b64}`;
    }

    const price = parseFloat(updateData.price ?? existing.price);
    const quantity = parseInt(updateData.quantity ?? existing.quantity);
    updateData.amount = price * quantity;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name color");

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
