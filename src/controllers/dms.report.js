const reportService = require("../services/dms/reports/report.revenue");
const actionService = require("../services/dms/reports/report.action");
exports.getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.body;

    // 1️⃣ Check tồn tại
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng truyền đầy đủ from và to (YYYY-MM-DD)"
      });
    }

    // 2️⃣ Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng ngày phải là YYYY-MM-DD"
      });
    }

    // 3️⃣ Convert sang Date để so sánh
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày không hợp lệ"
      });
    }

    // 4️⃣ Check from <= to
    if (fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
      });
    }

    const data = await reportService.getRevenueByDateRange(from, to);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getRevenueReportAction = async (req, res) => {
  try {
    const {
      action,
      fromDate,
      toDate,
      customer,
      advisor,
      plate,
      roNo,
      model
    } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu fromDate hoặc toDate"
      });
    }

    const result = await actionService.processRevenueAction({
      action,
      fromDate,
      toDate,
      customer,
      advisor,
      plate,
      roNo,
      model
    });

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};