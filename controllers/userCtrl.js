const Users = require("../models/userModel");

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
    const searchQuery = ["firstName", "lastName", "username"].reduce(
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

const userCtrl = {
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);
      if (!user)
        return res.status(400).json({ msg: "Foydalanuvchi mavjud emas." });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUsers: async (req, res) => {
    try {
      const features = new APIfeatures(Users.find({ role: 0 }), req.query)
        .filtering()
        .sorting()
        .searching();

      const total = await features.query;

      const featuresWithPgntn = features.paginating();

      const users = await featuresWithPgntn.query;
      
      res.json({
        total: total.length,
        users,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createUser: async (req, res) => {
    try {
      const { firstName, lastName, username, phoneNumber, password } = req.body;
      const user = await Users.findOne({ username });

      if (user) return res.status(400).json({ msg: "This user exists !" });

      const newUser = new Users({
        firstName,
        lastName,
        username,
        phoneNumber,
        password,
      });

      await newUser.save();

      newUser.password = undefined;

      res.json(newUser);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { firstName, lastName, username, phoneNumber, password } = req.body;

      const user = await Users.findOneAndUpdate(
        { _id: req.params.id },
        {
          firstName,
          lastName,
          username,
          phoneNumber,
          password,
        },
        {
          new: true,
          runValidors: true,
        }
      );

      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      await Users.findByIdAndDelete(req.params.id);
      res.json({ msg: `The user with ${req.params.id} is deleted !` });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = userCtrl;
