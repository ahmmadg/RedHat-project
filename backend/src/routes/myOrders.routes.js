const router = require("express").Router();
const auth = require("../middleware/auth");
const { getMyOrders } = require("../controllers/myOrders.controller");

router.get("/", auth, getMyOrders);

module.exports = router;
