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
        ros: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    advisorMap[name].plates.add(item.PlateNo);
    advisorMap[name].ros.add(item.RONo);

    advisorMap[name].totalAmount += amount;
    advisorMap[name].totalVAT += vat;
    advisorMap[name].totalSumAmount += sum;

  });

  const advisors = Object.values(advisorMap).map(a => ({
    advisor: a.advisor,
    totalCars: a.plates.size,
    totalVisits: a.ros.size,
    totalAmount: Math.round(a.totalAmount),
    totalVAT: Math.round(a.totalVAT),
    totalSumAmount: Math.round(a.totalSumAmount)
  }));

  advisors.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return advisors;
};


// ============================
// Cố vấn doanh thu cao nhất
// ============================
exports.getTopAdvisor = function(list) {

  const advisors = this.getRevenueByAdvisor(list);

  if (advisors.length === 0) return null;

  return advisors[0];
};


// ============================
// Cố vấn doanh thu thấp nhất
// ============================
exports.getLowestAdvisor = function(list) {

  const advisors = this.getRevenueByAdvisor(list);

  if (advisors.length === 0) return null;

  advisors.sort((a, b) => a.totalSumAmount - b.totalSumAmount);

  return advisors[0];
};


// ============================
// Top N cố vấn doanh thu cao
// ============================
exports.getTopAdvisors = function(list, limit = 3) {

  const advisors = this.getRevenueByAdvisor(list);

  return advisors.slice(0, limit);
};


// ============================
// Cố vấn doanh thu cao nhất theo tháng
// ============================
exports.getTopAdvisorByMonth = function(list) {

  const monthAdvisorMap = {};

  list.forEach(item => {

    const month = item.PaidCreatedDate?.slice(0, 7);
    const advisor = item.CreatorName || "Unknown";

    const key = `${month}_${advisor}`;

    const sum = Number(item.SumAmount || 0);

    if (!monthAdvisorMap[key]) {
      monthAdvisorMap[key] = {
        month,
        advisor,
        plates: new Set(),
        ros: new Set(),
        revenue: 0
      };
    }

    monthAdvisorMap[key].plates.add(item.PlateNo);
    monthAdvisorMap[key].ros.add(item.RONo);

    monthAdvisorMap[key].revenue += sum;

  });

  const rows = Object.values(monthAdvisorMap).map(r => ({
    month: r.month,
    advisor: r.advisor,
    totalCars: r.plates.size,
    totalVisits: r.ros.size,
    totalRevenue: Math.round(r.revenue)
  }));


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