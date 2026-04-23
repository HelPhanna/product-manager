const Product = require("../../shared/models/Product");
const cloudinary = require("../../config/cloudinary");

// Helper: upload buffer to Cloudinary and return secure_url + public_id
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "product-manager",
        resource_type: "image",
        format: mimetype.split("/")[1],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

// Helper: delete image from Cloudinary by public_id
const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.warn("Could not delete old Cloudinary image:", err.message);
  }
};

// GET all products with search & filter
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category && category !== "all") query.category = category;

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

    if (req.file) {
      const { url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype,
      );
      productData.image = url;
      productData.imagePublicId = public_id;
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

    if (req.file) {
      await deleteFromCloudinary(existing.imagePublicId);
      const { url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype,
      );
      updateData.image = url;
      updateData.imagePublicId = public_id;
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
    await deleteFromCloudinary(product.imagePublicId);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
