const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
      validate: {
        validator: (v) => Number.isInteger(v) && v >= 0,
        message: "Quantity must be a non-negative whole number",
      },
    },
    amount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    // Cloudinary secure URL
    image: {
      type: String,
      default: null,
    },
    // Cloudinary public_id — needed to delete old images on update/delete
    imagePublicId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

productSchema.pre("save", function (next) {
  this.amount = this.price * this.quantity;
  next();
});

module.exports = mongoose.model("Product", productSchema);
