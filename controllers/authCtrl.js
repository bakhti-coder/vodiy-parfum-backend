const Users = require("../models/userModel");
const Payments = require("../models/paymentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authCtrl = {
  register: async (req, res) => {
    try {
      const { firstName, lastName, username, phoneNumber, password } = req.body;

      const user = await Users.findOne({ username });
      if (user) return res.status(400).json({ msg: "Bu foydalanuvchi mavjud" });

      const newUser = new Users({
        firstName,
        lastName,
        username,
        phoneNumber,
        password,
      });

      await newUser.save();

      // If register success , create access token and refresh token
      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      newUser.password = undefined;

      res.json({ accesstoken, user: newUser });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await Users.findOne({ username }).select("+password");
      if (!user)
        return res.status(400).json({ msg: "Bu foydalanuvchi mavjud emas" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Noto'g'ri parol" });

      // If login success , create access token and refresh token
      const accesstoken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      user.password = undefined;

      res.json({ accesstoken, user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "Siz chiqdingiz" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({
          msg: "Login qiling yoki ro'yxatdan o'ting",
        });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "Login qiling yoki ro'yxat" });

        const accesstoken = createAccessToken({ id: user.id });

        res.json({ accesstoken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getMe: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user)
        return res.status(400).json({ msg: "Foydalanuvchi mavjud emas." });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserPayments: async (req, res) => {
    try {
      const payments = await Payments.find({ userId: req.user.id }).populate({
        path: "cart.product",
        populate: {
          path: "category",
          model: "Category",
        },
      });

      res.json(payments);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { firstName, lastName, username, phoneNumber } = req.body;

      const user = await Users.findByIdAndUpdate(
        req.user.id,
        { firstName, lastName, username, phoneNumber },
        {
          new: true,
          runValidors: true,
        }
      );

      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatePassword: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("+password");

      // Check current password
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isMatch)
        return res.status(400).json({ msg: "Current password is wrong !" });

      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json(user);
    } catch (err) {
      return res.status(400).json({ msg: err.message });
    }
  },
};

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = authCtrl;
