const router = require("express").Router();
const authCtrl = require("../controllers/authCtrl");
const auth = require("../middleware/auth");

router.post("/register", authCtrl.register);

router.post("/login", authCtrl.login);

router.get("/logout", auth, authCtrl.logout);

router.get("/refresh_token", auth, authCtrl.refreshToken);

router.get("/me", auth, authCtrl.getMe);

router.put("/update", auth, authCtrl.updateUser);

router.put("/password", auth, authCtrl.updatePassword);

router.get("/payments", auth, authCtrl.getUserPayments);

module.exports = router;
