const dmsService = require("../services/dms/dms.service");
const quotationService = require("../services/dms/quotation/quotation.service");
const settlementService = require("../services/dms/invoice/settlement.service");

exports.getByKeyNo = async (req, res) => {
  try {
    const { keyNo } = req.body;
    const { SearchType } = req.body;
    if (!keyNo) {
      return res.status(400).json({
        success: false,
        message: "keyNo is required"
      });
    }
    if (!SearchType) {
      return res.status(400).json({
        success: false,
        message: "SearchType is required"
      });
    }

    const data = await dmsService.getByKeyNo(keyNo,SearchType);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("DMS Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getQuotation = async (req, res) => {
  const { keyNo } = req.body;
   if (!keyNo) {
      return res.status(400).json({
        success: false,
        message: "keyNo is required"
      });
    }
  const data = await quotationService.getQuotationDetail(keyNo);

  res.json({ success: true, data });
};
exports.settlementInvoice = async (req, res) => {
  const { keyNo } = req.body;
  if (!keyNo) {
    return res.status(400).json({
      success: false,
      message: "keyNo is required"
    });
  }
  const data = await settlementService.settlementInvoice(keyNo);
  res.json({ success: true, data });
};