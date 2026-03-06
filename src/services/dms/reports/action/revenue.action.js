// =============================
// Ngày có doanh thu cao nhất
// =============================
exports.getTopRevenueDay = function(list) {

  const dayMap = {};

  list.forEach(item => {

    const date = item.PaidCreatedDate?.split(' ')[0];

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!dayMap[date]) {
      dayMap[date] = {
        day: date,
        plates: new Set(),
        ros: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    dayMap[date].plates.add(item.PlateNo);
    dayMap[date].ros.add(item.RONo);

    dayMap[date].totalAmount += amount;
    dayMap[date].totalVAT += vat;
    dayMap[date].totalSumAmount += sum;

  });

  const days = Object.values(dayMap).map(d => ({
    day: d.day,
    totalCars: d.plates.size,
    totalVisits: d.ros.size,
    totalAmount: Math.round(d.totalAmount),
    totalVAT: Math.round(d.totalVAT),
    totalSumAmount: Math.round(d.totalSumAmount)
  }));

  days.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return days[0];
};


// =============================
// Ngày có doanh thu thấp nhất
// =============================
exports.getLowestRevenueDay = function(list) {

  const dayMap = {};

  list.forEach(item => {

    const date = item.PaidCreatedDate?.split(' ')[0];

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!dayMap[date]) {
      dayMap[date] = {
        day: date,
        plates: new Set(),
        ros: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    dayMap[date].plates.add(item.PlateNo);
    dayMap[date].ros.add(item.RONo);

    dayMap[date].totalAmount += amount;
    dayMap[date].totalVAT += vat;
    dayMap[date].totalSumAmount += sum;

  });

  const days = Object.values(dayMap).map(d => ({
    day: d.day,
    totalCars: d.plates.size,
    totalVisits: d.ros.size,
    totalAmount: Math.round(d.totalAmount),
    totalVAT: Math.round(d.totalVAT),
    totalSumAmount: Math.round(d.totalSumAmount)
  }));

  days.sort((a, b) => a.totalSumAmount - b.totalSumAmount);

  return days[0];
};


// =============================
// Tháng có doanh thu cao nhất
// =============================
exports.getTopRevenueMonth = function(list) {

  const monthMap = {};

  list.forEach(item => {

    const month = item.PaidCreatedDate?.slice(0, 7);

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        plates: new Set(),
        ros: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    monthMap[month].plates.add(item.PlateNo);
    monthMap[month].ros.add(item.RONo);

    monthMap[month].totalAmount += amount;
    monthMap[month].totalVAT += vat;
    monthMap[month].totalSumAmount += sum;

  });

  const months = Object.values(monthMap).map(m => ({
    month: m.month,
    totalCars: m.plates.size,
    totalVisits: m.ros.size,
    totalAmount: Math.round(m.totalAmount),
    totalVAT: Math.round(m.totalVAT),
    totalSumAmount: Math.round(m.totalSumAmount)
  }));

  months.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return months[0];
};


// =============================
// Tháng có doanh thu thấp nhất
// =============================
exports.getLowestRevenueMonth = function(list) {

  const monthMap = {};

  list.forEach(item => {

    const month = item.PaidCreatedDate?.slice(0, 7);

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        plates: new Set(),
        ros: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    monthMap[month].plates.add(item.PlateNo);
    monthMap[month].ros.add(item.RONo);

    monthMap[month].totalAmount += amount;
    monthMap[month].totalVAT += vat;
    monthMap[month].totalSumAmount += sum;

  });

  const months = Object.values(monthMap).map(m => ({
    month: m.month,
    totalCars: m.plates.size,
    totalVisits: m.ros.size,
    totalAmount: Math.round(m.totalAmount),
    totalVAT: Math.round(m.totalVAT),
    totalSumAmount: Math.round(m.totalSumAmount)
  }));

  months.sort((a, b) => a.totalSumAmount - b.totalSumAmount);

  return months[0];
};


// =============================
// Doanh thu trung bình
// =============================
exports.calculateAverageRevenue = function(list) {

  const dayMap = {};

  list.forEach(item => {

    const date = item.PaidCreatedDate?.split(' ')[0];
    const sum = Number(item.SumAmount || 0);

    if (!dayMap[date]) {
      dayMap[date] = {
        revenue: 0,
        plates: new Set(),
        ros: new Set()
      };
    }

    dayMap[date].revenue += sum;
    dayMap[date].plates.add(item.PlateNo);
    dayMap[date].ros.add(item.RONo);

  });

  const days = Object.values(dayMap);

  if (days.length === 0) {
    return {
      days: 0,
      averageRevenue: 0,
      averageCars: 0,
      averageVisits: 0
    };
  }

  let totalRevenue = 0;
  let totalCars = 0;
  let totalVisits = 0;

  days.forEach(d => {
    totalRevenue += d.revenue;
    totalCars += d.plates.size;
    totalVisits += d.ros.size;
  });

  return {
    days: days.length,
    averageRevenue: Math.round(totalRevenue / days.length),
    averageCars: Math.round(totalCars / days.length),
    averageVisits: Math.round(totalVisits / days.length)
  };
};