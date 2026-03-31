const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be non-negative'],
      default: 0,
    },
    // Auto-calculated: price * quantity
    amount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-calculate amount before saving
productSchema.pre('save', function (next) {
  this.amount = this.price * this.quantity;
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.price !== undefined || update.quantity !== undefined) {
    // Will be handled in route
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
