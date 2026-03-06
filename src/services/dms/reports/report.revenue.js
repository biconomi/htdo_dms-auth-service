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
    raw: revenueRes,
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
      totalVisits: 0,
      totalAmount: 0,
      totalVAT: 0,
      totalSumAmount: 0,
      advisors: []
    };
  }

  // Xe khác nhau
  const uniquePlates = new Set(list.map(item => item.PlateNo));

  // Lượt ghé xưởng (RO)
  const uniqueROs = new Set(list.map(item => item.RONo));

  const totalCars = uniquePlates.size;
  const totalVisits = uniqueROs.size;

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
        ros: new Set(),
        amount: 0,
        vat: 0,
        sumAmount: 0
      };
    }

    advisorMap[name].plates.add(item.PlateNo);
    advisorMap[name].ros.add(item.RONo);

    advisorMap[name].amount += amount;
    advisorMap[name].vat += vat;
    advisorMap[name].sumAmount += sumAmount;
  });

  const advisors = Object.values(advisorMap)
    .map(a => ({
      name: a.name,
      totalCars: a.plates.size,
      totalVisits: a.ros.size,
      totalAmount: roundMoney(a.amount),
      totalVAT: roundMoney(a.vat),
      totalSumAmount: roundMoney(a.sumAmount)
    }))
    .sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return {
    totalCars,
    totalVisits,
    totalAmount: roundMoney(totalAmount),
    totalVAT: roundMoney(totalVAT),
    totalSumAmount: roundMoney(totalSumAmount),
    advisors
  };
}