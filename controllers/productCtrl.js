const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Payments = require("../models/paymentModel");
const Users = require("../models/userModel");

const newDate = (a) => {
  return a.toISOString().split("T")[0];
};

const cartSumQuantity = (cart) => {
  if (cart.length !== 0) {
    let sum = cart
      .map((o) => o.quantity)
      .reduce((a, c) => {
        return a + c;
      });

    return sum;
  } else {
    return 0;
  }
};

const getDayProducts = (products, cart) => {
  products2 = products;
  cart.map((product) => {
    if (products2.filter((item) => item.id === product._id).length !== 0) {
      products2[
        products2.findIndex((item2) => item2.id === product._id)
      ].quantity += product.quantity;
    } else {
      products2.push({
        id: product._id,
        title: product.title,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        image: product.image,
      });
    }
  });
  return products2;
};

// Filter, sorting and paginating

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.query

    const excludedFields = ["page", "sort", "limit", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  searching() {
    // All the datas
    const searchQuery = ["title", "description"].reduce(
      (acc, el) => {
        let searchEl = {
          [el]: {
            $regex: this.queryString.search,
            $options: "i",
          },
        };
        acc["$or"].push(searchEl);
        return acc;
      },
      { $or: [] }
    );
    this.queryString.search && (this.query = this.query.find(searchQuery));

    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(
        Products.find().populate({
          path: "category",
          model: "Category",
        }),
        req.query
      )
        .filtering()
        .sorting()
        .searching();

      const total = await features.query;

      const featuresWithPgntn = features.paginating();

      const products = await featuresWithPgntn.query;

      res.json({
        total: total.length,
        products,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getLastCategoryProducts: async (req, res) => {
    try {
      const categories = await Category.find();
      const products = await Products.find();
      const lastProducts = [];
      categories.forEach((category) => {
        lastProducts.push(
          products
            // .reverse()
            .find((product) => product.category === category.id)
        );
      });
      res.json(lastProducts);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getStatics: async (req, res) => {
    try {
      const paymentsNumber = (await Payments.find({ status: false })).length;
      const productsNumber = (await Products.find()).length;
      const usersNumber = (await Users.find({ role: 0 })).length;

      const commonNumbers = {
        paymentsNumber,
        productsNumber,
        usersNumber,
      };
      res.json(commonNumbers);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getLastTenDayStatics: async (req, res) => {
    try {
      const todayDate = new Date();
      const payments = await Payments.find();
      days = parseInt(req.params.id);

      dates = Array(days).fill(0);

      days_payments = [];

      for (i = 0; i < days; i++) {
        days_payments.push(
          payments.filter(
            (item) =>
              newDate(item.createdAt) ===
              newDate(new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000))
          )
        );
        dates[i] = newDate(
          new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000)
        );
      }

      numbers = Array(days).fill(0);
      days_products = Array(days).fill(0);

      days_payments.forEach((item, index) => {
        days_products[index] = {
          date: "",
          products: [],
        };
        item.forEach((item2) => {
          numbers[index] += cartSumQuantity(item2.cart);
          days_products[index].date = item2.createdAt;
          // days_products[index].products = days_products[index].products.concat(
          //   item2.cart
          // );
          days_products[index].products = getDayProducts(
            days_products[index].products,
            item2.cart
          );
        });
      });
      res.json({ numbers, dates, days_products });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const { title, price, description, image, quantity, category } = req.body;
      const categoryFound = await Category.findById(category);

      if (!categoryFound)
        return res.status(400).json({ msg: "Kategoriya mavjud emas !" });

      if (!image) return res.status(400).json({ msg: "Rasm joylanmagan !" });

      const product = await Products.findOne({ title });
      if (product) return res.status(400).json({ msg: "Bu mahsulot mavjud !" });

      const newProduct = new Products({
        title,
        price,
        description,
        image,
        quantity,
        category,
      });

      await newProduct.save();
      res.json({ msg: "Mahsulot yaratildi" });
    } catch (err) {
      // console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await Products.findByIdAndDelete(req.params.id);
      res.json({ msg: "Mahsulot o'chirildi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { title, price, description, image, quantity, category } = req.body;
      if (!image) return res.status(400).json({ msg: "Rasm joylanmadi !" });

      await Products.findOneAndUpdate(
        { _id: req.params.id },
        {
          title,
          price,
          description,
          image,
          quantity,
          category,
        }
      );

      res.json({ msg: "Mahsulot o'zgartirildi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getProduct: async (req, res) => {
    try {
      const product = await Products.findById(req.params.id);
      res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;
