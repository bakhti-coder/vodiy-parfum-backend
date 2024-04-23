const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

const categoryCtrl = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getCategory: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      res.status(200).json(category);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      // if user have role = 1 ---> admin
      // only admin can create , delete and update category
      const { name, image } = req.body;
      if (!image) return res.status(400).json({ msg: "Rasm joylanmagan !" });

      const category = await Category.findOne({ name });
      if (category)
        return res.status(400).json({ msg: "Bu kategoriya mavjud" });

      const newCategory = new Category({ name, image });

      await newCategory.save();
      res.json(newCategory);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const products = await Products.findOne({ category: req.params.id });
      if (products)
        return res.status(400).json({
          msg: "Avval kategoriyaga tegishli mahsulotlarni o'chiring",
        });

      await Category.findByIdAndDelete(req.params.id);
      res.json({ msg: "Kategoriya o'chirildi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateCategory: async (req, res) => {
    try {
      const { name, image } = req.body;
      await Category.findOneAndUpdate({ _id: req.params.id }, { name, image });

      res.json({ msg: "Kategoriya yangilandi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = categoryCtrl;
