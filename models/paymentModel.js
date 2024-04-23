const mongoose = require("mongoose");

const userCart = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    cart: {
      type: [userCart],
      default: [],
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACCEPTED", "CANCELED", "SUCCESS"],
      default: "ACCEPTED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payments", paymentSchema);
