const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");

require("dotenv").config();

// Load models
const Product = require("./models/productModel");
const Category = require("./models/categoryModel");

// Connect to DB
mongoose.connect(
  process.env.MONGODB_URL,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to MongoDB");
  }
);

// Read JSON files
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/data/products.json`, "utf-8")
);

const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/data/categories.json`, "utf-8")
);

// Import into DB
const importData = async () => {
  try {
    await Product.create(products);
    await Category.create(categories);
    console.log("Data imported...".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();
    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}