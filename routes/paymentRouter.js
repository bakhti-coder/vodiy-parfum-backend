const router = require("express").Router();
const paymentCtrl = require("../controllers/paymentCtrl");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

router
  .route("/payment")
  .post(auth, paymentCtrl.createPayment)
  .get(auth, authAdmin, paymentCtrl.getPayments);

router
  .route("/payment/:id")
  .post(auth, authAdmin, paymentCtrl.sendConfirm)
  .put(auth, authAdmin, paymentCtrl.cancelPayment);

module.exports = router;