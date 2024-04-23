const router = require("express").Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} = require("../controllers/userCtrl");

const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

router.use(auth);
router.use(authAdmin);

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
