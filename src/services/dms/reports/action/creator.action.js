exports.getRevenueByAdvisor = function(list) {

  const advisorMap = {};

  list.forEach(item => {

    const name = item.CreatorName || "Unknown";

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!advisorMap[name]) {
      advisorMap[name] = {
        advisor: name,
        plates: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    advisorMap[name].plates.add(item.PlateNo);
    advisorMap[name].totalAmount += amount;
    advisorMap[name].totalVAT += vat;
    advisorMap[name].totalSumAmount += sum;

  });

  const advisors = Object.values(advisorMap).map(a => ({
    advisor: a.advisor,
    totalCars: a.plates.size,
    totalAmount: Math.round(a.totalAmount),
    totalVAT: Math.round(a.totalVAT),
    totalSumAmount: Math.round(a.totalSumAmount)
  }));

  // sort giảm dần theo doanh thu
  advisors.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return advisors;
};

// Lấy cố vấn có doanh thu cao nhất
exports.getTopAdvisor = function(list) {

  const advisors = this.getRevenueByAdvisor(list);

  if (advisors.length === 0) return null;

  return advisors[0]; // đã sort giảm dần
};
// Lấy cố vẫn có doanh thu thấp nhất
exports.getLowestAdvisor = function(list) {

  const advisors = this.getRevenueByAdvisor(list);

  if (advisors.length === 0) return null;

  advisors.sort((a, b) => a.totalSumAmount - b.totalSumAmount);

  return advisors[0];
};

// top 3 cố vấn có doanh thu cao nhất
exports.getTopAdvisors = function(list, limit = 3) {

  const advisors = this.getRevenueByAdvisor(list);

  return advisors.slice(0, limit);
};

// lấy doanh thu cao nhất của mỗi tháng theo cố vẫn dịch vụ chỉ lấy người cao nhất
exports.getTopAdvisorByMonth = function(list) {

  const monthAdvisorMap = {};

  list.forEach(item => {

    const month = item.PaidCreatedDate?.slice(0, 7); // YYYY-MM
    const advisor = item.CreatorName || "Unknown";
    const key = `${month}_${advisor}`;

    const sum = Number(item.SumAmount || 0);

    if (!monthAdvisorMap[key]) {
      monthAdvisorMap[key] = {
        month,
        advisor,
        plates: new Set(),
        revenue: 0
      };
    }

    monthAdvisorMap[key].plates.add(item.PlateNo);
    monthAdvisorMap[key].revenue += sum;

  });

  // convert sang array
  const rows = Object.values(monthAdvisorMap).map(r => ({
    month: r.month,
    advisor: r.advisor,
    totalCars: r.plates.size,
    totalRevenue: Math.round(r.revenue)
  }));

  // group theo tháng để lấy max
  const result = {};

  rows.forEach(r => {

    if (!result[r.month]) {
      result[r.month] = r;
      return;
    }

    if (r.totalRevenue > result[r.month].totalRevenue) {
      result[r.month] = r;
    }

  });

  return Object.values(result).sort((a, b) => a.month.localeCompare(b.month));

};
