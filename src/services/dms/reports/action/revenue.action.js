// action

exports.getTopRevenueDay = function(list) {

  const dayMap = {};

  list.forEach(item => {

    const date = item.PaidCreatedDate?.split(' ')[0]; // lấy YYYY-MM-DD

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!dayMap[date]) {
      dayMap[date] = {
        day: date,
        plates: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    dayMap[date].plates.add(item.PlateNo);
    dayMap[date].totalAmount += amount;
    dayMap[date].totalVAT += vat;
    dayMap[date].totalSumAmount += sum;

  });

  const days = Object.values(dayMap).map(d => ({
    day: d.day,
    totalCars: d.plates.size,
    totalAmount: Math.round(d.totalAmount),
    totalVAT: Math.round(d.totalVAT),
    totalSumAmount: Math.round(d.totalSumAmount)
  }));

  // sort giảm dần theo doanh thu
  days.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return days[0]; // ngày cao nhất
}
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
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    dayMap[date].plates.add(item.PlateNo);
    dayMap[date].totalAmount += amount;
    dayMap[date].totalVAT += vat;
    dayMap[date].totalSumAmount += sum;

  });

  const days = Object.values(dayMap).map(d => ({
    day: d.day,
    totalCars: d.plates.size,
    totalAmount: Math.round(d.totalAmount),
    totalVAT: Math.round(d.totalVAT),
    totalSumAmount: Math.round(d.totalSumAmount)
  }));

  // sort tăng dần
  days.sort((a, b) => a.totalSumAmount - b.totalSumAmount);

  return days[0]; // ngày thấp nhất
}
// tháng có doanh thu cao nhất
exports.getTopRevenueMonth = function(list) {

  const monthMap = {};

  list.forEach(item => {

    const month = item.PaidCreatedDate?.slice(0, 7); // YYYY-MM

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!monthMap[month]) {
      monthMap[month] = {
        month: month,
        plates: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    monthMap[month].plates.add(item.PlateNo);
    monthMap[month].totalAmount += amount;
    monthMap[month].totalVAT += vat;
    monthMap[month].totalSumAmount += sum;

  });

  const months = Object.values(monthMap).map(m => ({
    month: m.month,
    totalCars: m.plates.size,
    totalAmount: Math.round(m.totalAmount),
    totalVAT: Math.round(m.totalVAT),
    totalSumAmount: Math.round(m.totalSumAmount)
  }));

  // sort giảm dần
  months.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return months[0]; // tháng doanh thu cao nhất
};

// tháng có doanh thu thấp nhất
exports.getLowestRevenueMonth = function(list) {

  const monthMap = {};

  list.forEach(item => {

    const month = item.PaidCreatedDate?.slice(0, 7); // YYYY-MM

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        plates: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    monthMap[month].plates.add(item.PlateNo);
    monthMap[month].totalAmount += amount;
    monthMap[month].totalVAT += vat;
    monthMap[month].totalSumAmount += sum;

  });

  const months = Object.values(monthMap).map(m => ({
    month: m.month,
    totalCars: m.plates.size,
    totalAmount: Math.round(m.totalAmount),
    totalVAT: Math.round(m.totalVAT),
    totalSumAmount: Math.round(m.totalSumAmount)
  }));

  // sort tăng dần
  months.sort((a, b) => a.totalSumAmount - b.totalSumAmount);

  return months[0]; // tháng thấp nhất
};

// doanh thu trung bình theo khoản thời gian
exports.calculateAverageRevenue = function(list) {

  const dayMap = {};

  list.forEach(item => {

    const date = item.PaidCreatedDate?.split(' ')[0];
    const sum = Number(item.SumAmount || 0);

    if (!dayMap[date]) {
      dayMap[date] = {
        revenue: 0,
        plates: new Set()
      };
    }

    dayMap[date].revenue += sum;
    dayMap[date].plates.add(item.PlateNo);

  });

  const days = Object.values(dayMap);

  if (days.length === 0) {
    return {
      days: 0,
      averageRevenue: 0,
      averageCars: 0
    };
  }

  let totalRevenue = 0;
  let totalCars = 0;

  days.forEach(d => {
    totalRevenue += d.revenue;
    totalCars += d.plates.size;
  });

  return {
    days: days.length,
    averageRevenue: Math.round(totalRevenue / days.length),
    averageCars: Math.round(totalCars / days.length)
  };
};