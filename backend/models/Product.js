const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: 'EcoNexus',
      trim: true,
    },
    sku: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviews: {
      type: Number,
      default: 100,
    },
    image: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    warranty: {
      type: String,
      default: '1 Year Manufacturer Warranty',
    },
    highlights: {
      type: [String],
      default: [],
    },
    specs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    inTheBox: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
