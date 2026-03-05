const callDms = require('../dms.client');
const revenuAction = require('./action/revenue.action');
const creatorAction = require('./action/creator.action');
const modelAction = require('./action/model.action');
exports.getRevenueByDateRange = async (from, to) => {
  console.log('Tiến hành lấy báo cáo doanh thu từ DMS:', from, to);

  const revenueRes = await callDms(
    '/Ser_InvReportRevenueRpt/SearchDL',
    {
      FromDate: from,
      ToDate: to,
      DealerCode: 'VS086.1',
      UserCode: '',
      FlagDataWH: ''
    }
  );

  if (revenueRes === false) {
    throw new Error('Token expired');
  }

  const revenueData = revenueRes?.Data?._objResult?.Data;

  if (!revenueData) {
    throw new Error('Không lấy được dữ liệu báo cáo doanh thu');
  }
    // 🔥 lấy list ra luôn
  const list = revenueData.lst_Ser_InvReportRevenueRpt || [];
  return {
    raw: revenueRes,
    list, // ⭐ thêm cái này
    fromDate: from,
    toDate: to,
    queriedAt: new Date().toISOString(), // thời điểm server xử lý
    calculated: mapRevenueResponse(revenueData)
  };
};

function roundMoney(value) {
  return Math.round(value);
}

function mapRevenueResponse(rawData) {
  const list = rawData?.lst_Ser_InvReportRevenueRpt || [];

  if (!Array.isArray(list) || list.length === 0) {
    return {
      totalCars: 0,
      totalAmount: 0,
      totalVAT: 0,
      totalSumAmount: 0,
      advisors: []
    };
  }

  const uniquePlates = new Set(list.map(item => item.PlateNo));
  const totalCars = uniquePlates.size;

  let totalAmount = 0;
  let totalVAT = 0;
  let totalSumAmount = 0;

  const advisorMap = {};

  list.forEach(item => {
    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sumAmount = Number(item.SumAmount || 0);

    totalAmount += amount;
    totalVAT += vat;
    totalSumAmount += sumAmount;

    const name = item.CreatorName || "Unknown";

    if (!advisorMap[name]) {
      advisorMap[name] = {
        name,
        plates: new Set(),
        amount: 0,
        vat: 0,
        sumAmount: 0
      };
    }

    advisorMap[name].plates.add(item.PlateNo);
    advisorMap[name].amount += amount;
    advisorMap[name].vat += vat;
    advisorMap[name].sumAmount += sumAmount;
  });

  // 🔥 Convert thành mảng + sort giảm dần
  const advisors = Object.values(advisorMap)
    .map(a => ({
      name: a.name,
      totalCars: a.plates.size,
      totalAmount: roundMoney(a.amount),
      totalVAT: roundMoney(a.vat),
      totalSumAmount: roundMoney(a.sumAmount)
    }))
    .sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return {
    totalCars,
    totalAmount: roundMoney(totalAmount),
    totalVAT: roundMoney(totalVAT),
    totalSumAmount: roundMoney(totalSumAmount),
    advisors // trả toàn bộ danh sách
  };
}


/**
 * MAIN ENTRY
 * API AI sẽ gọi vào đây
 * payload:
 * {
 *   action: string
 *   fromDate?: string
 *   toDate?: string
 *   advisor?: string
 *   model?: string
 *   customer?: string
 * }
 */
/**
 * Lấy dữ liệu doanh thu từ DMS
 */
exports.processRevenueAction = async (payload) => {

  const {
    action,
    fromDate,
    toDate
  } = payload;

  /**
   * Lấy dữ liệu doanh thu từ DMS
   */
  const base = await exports.getRevenueByDateRange(fromDate, toDate);

  const list = base.list || [];
  const queriedAt= base.queriedAt;
  const calculated = base.calculated;
  switch (action) {

    /** =========================
     * DOANH THU THEO THỜI GIAN
     * ========================= */

    /**
     * Tổng doanh thu trong khoảng thời gian
     */
    case 'total_revenue':
      return {
        fromDate,
        toDate,
        queriedAt,
        totalRevenue: calculated.totalSumAmount,
        totalCars: calculated.totalCars

      };
    /**
     * Ngày có doanh thu cao nhất trong khoảng thời gian
     */
    case 'highest_revenue_day':
      return {
        fromDate,
        toDate,
        queriedAt,
        data: revenuAction.getTopRevenueDay(list)
      };

    /**
     * Ngày có doanh thu thấp nhất trong khoảng thời gian
     */
    case 'lowest_revenue_day':
      return {
        fromDate,
        toDate,
        queriedAt,
        data: revenuAction.getLowestRevenueDay(list)
      };

    // tháng có doanh thu cao nhất
    case 'highest_revenue_month':
      return {
        fromDate, 
        toDate,
        queriedAt,
        data: revenuAction.getTopRevenueMonth(list)
      };
    // tháng có doanh thu thấp nhất
    case 'lowest_revenue_month':
      return {
        fromDate,     
        toDate,
        queriedAt,
        data: revenuAction.getLowestRevenueMonth(list)
      };
    
    /**
     * Doanh thu trung bình trong khoảng thời gian
     */
    case 'average_revenue':
      return {
        fromDate,
        toDate,
        queriedAt,
        averageRevenue: revenuAction.calculateAverageRevenue(list)
      };
    // Cố vẫn
    // doanh thu theo cố vấn
    case 'revenue_by_advisor':
      return {
        fromDate, 
        toDate,
        queriedAt,
        data: creatorAction.getRevenueByAdvisor(list)
      };
    // cố vấn có doanh thu cao nhất
    case 'top_advisor':
      return { 
        fromDate,
        toDate,
        queriedAt,
        data: creatorAction.getTopAdvisor(list)
      };
      // cố vấn có doanh thu thấp nhất
    case 'lowest_advisor':
      return { 
        fromDate,
        toDate,
        queriedAt,
        data: creatorAction.getLowestAdvisor(list)
      };
    // top 3 cố vấn có doanh thu cao nhất
    case 'top_3_advisors':
      return { 
        fromDate,
        toDate,
        queriedAt,
        data: creatorAction.getTopAdvisors(list, 3)
      };
    // cố vấn có doanh thu cao nhất của mỗi tháng
    case 'top_advisor_by_month':
      return {  
        fromDate,
        toDate,
        queriedAt,
        data: creatorAction.getTopAdvisorByMonth(list)
      };

    // model xe
    // doanh thu theo model xe giảm dần
    case 'revenue_by_car_model':
      return {
        fromDate,
        toDate,
        queriedAt,
        data: modelAction.getRevenueByCarModel(list)
      };
    // model xe có doanh thu cao nhất
    case 'top_revenue_car_model':
      return {
        fromDate,
        toDate,
        queriedAt,
        data: modelAction.getTopRevenueCarModel(list)
      };
    // model xe có doanh thu thấp nhất
    case 'lowest_revenue_car_model':
      return {
        fromDate,
        toDate,
        queriedAt,
        data: modelAction.getLowestRevenueCarModel(list)
      };
    // model xe có số lượng sửa chữa nhiều nhất
    case 'top_car_by_count':
      return {
        fromDate,
        toDate,
        queriedAt,
        data: modelAction.getTopCarByCount(list)
      };
    // top 5 model xe có số lượng sửa chữa nhiều nhất
    case 'top_5_cars_by_count':
      return {
        fromDate,
        toDate,
        queriedAt,
        data: modelAction.getTopCarByCounts(list, 5)
      };
    default:
      throw new Error('Action không hợp lệ');
  }
};
