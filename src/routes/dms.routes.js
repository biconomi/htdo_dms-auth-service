const express = require("express");
const router = express.Router();
const dmsController = require("../controllers/dms.controller");

router.post("/getByKeyNo/search", dmsController.getByKeyNo);
router.post("/quotation", dmsController.getQuotation);
// quyết toán
router.post("/settlement", dmsController.settlementInvoice);
module.exports = router;