const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: Object,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, //important
  }
);

module.exports = mongoose.model("Products", productSchema);
