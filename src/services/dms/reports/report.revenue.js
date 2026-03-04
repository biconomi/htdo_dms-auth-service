const callDms = require('../../dms/dms.client');

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

  return {
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
      topAdvisor: null
    };
  }

  // 1️⃣ Lọc xe không trùng biển số
  const uniquePlates = new Set(list.map(item => item.PlateNo));
  const totalCars = uniquePlates.size;

  // 2️⃣ Tổng doanh thu
  let totalAmount = 0;
  let totalVAT = 0;
  let totalSumAmount = 0;

  // 3️⃣ Gom theo cố vấn dịch vụ
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

  // 4️⃣ Tìm cố vấn cao nhất
  const advisors = Object.values(advisorMap);
  const topAdvisor = advisors.sort((a, b) => b.sumAmount - a.sumAmount)[0];

  return {
    totalCars,
    totalAmount: roundMoney(totalAmount),
    totalVAT: roundMoney(totalVAT),
    totalSumAmount: roundMoney(totalSumAmount),
    topAdvisor: topAdvisor
      ? {
          name: topAdvisor.name,
          totalCars: topAdvisor.plates.size,
          totalAmount: roundMoney(topAdvisor.amount),
          totalVAT: roundMoney(topAdvisor.vat),
          totalSumAmount: roundMoney(topAdvisor.sumAmount)
        }
      : null
  };
}