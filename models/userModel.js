const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: [6, "Password's minimal length must be equal 6 !"],
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Users", userSchema);
