const express = require("express");
const router = express.Router();
const dmsController = require("../controllers/dms.controller");
const dmsReportController = require("../controllers/dms.report");
router.post("/getByKeyNo/search", dmsController.getByKeyNo);
router.post("/quotation", dmsController.getQuotation);
// quyết toán
router.post("/settlementInvoice", dmsController.settlementInvoice);


// báo cáo doanh thu
router.post("/reports/revenue", dmsReportController.getRevenueReport);
router.post("/reports/revenueAction", dmsReportController.getRevenueReportAction);
module.exports = router;