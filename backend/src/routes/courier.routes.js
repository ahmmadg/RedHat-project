const router = require("express").Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const c = require("../controllers/courier.controller");

router.use(auth, roleCheck("COURIER"));

router.get("/orders", c.getAssignedOrders);
router.patch("/orders/:id/accept", c.acceptOrder);
router.patch("/orders/:id/decline", c.declineOrder);
router.patch("/orders/:id/status", c.updateStatus);

module.exports = router;
