const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Routes
app.use("/api/v1/user", require("./routes/userRouter"));
app.use("/api/v1/auth", require("./routes/authRouter"));
app.use("/api/v1", require("./routes/categoryRouter"));
app.use("/api/v1", require("./routes/upload"));
app.use("/api/v1", require("./routes/productRouter"));
app.use("/api/v1", require("./routes/paymentRouter"));

// Connect to mongodb
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

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is working in port ${PORT}`);
});
