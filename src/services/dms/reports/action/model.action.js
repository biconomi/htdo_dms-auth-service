// ============================
// Doanh thu theo model xe
// ============================
exports.getRevenueByCarModel = function(list) {

  const modelMap = {};

  list.forEach(item => {

    const model = item.TradeMarkNameModel || "Unknown";

    const amount = Number(item.Amount || 0);
    const vat = Number(item.AmountVAT || 0);
    const sum = Number(item.SumAmount || 0);

    if (!modelMap[model]) {
      modelMap[model] = {
        model,
        plates: new Set(),
        ros: new Set(),
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    modelMap[model].plates.add(item.PlateNo);
    modelMap[model].ros.add(item.RONo);

    modelMap[model].totalAmount += amount;
    modelMap[model].totalVAT += vat;
    modelMap[model].totalSumAmount += sum;

  });

  const result = Object.values(modelMap).map(m => ({
    model: m.model,
    totalCars: m.plates.size,
    totalVisits: m.ros.size,
    totalAmount: Math.round(m.totalAmount),
    totalVAT: Math.round(m.totalVAT),
    totalSumAmount: Math.round(m.totalSumAmount)
  }));

  result.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return result;

};


// ============================
// Model xe doanh thu cao nhất
// ============================
exports.getTopRevenueCarModel = function(list) {

  const models = exports.getRevenueByCarModel(list);

  if (!models.length) return null;

  return models[0];

};


// ============================
// Model xe doanh thu thấp nhất
// ============================
exports.getLowestRevenueCarModel = function(list) {

  const models = exports.getRevenueByCarModel(list);

  if (!models.length) return null;

  return models[models.length - 1];

};


// ============================
// Model xe có lượt sửa nhiều nhất
// ============================
exports.getTopCarByCount = function(list) {

  const modelMap = {};

  list.forEach(item => {

    const model = item.TradeMarkNameModel || "Unknown";

    if (!modelMap[model]) {
      modelMap[model] = {
        model,
        plates: new Set(),
        ros: new Set()
      };
    }

    modelMap[model].plates.add(item.PlateNo);
    modelMap[model].ros.add(item.RONo);

  });

  const result = Object.values(modelMap).map(m => ({
    model: m.model,
    totalCars: m.plates.size,
    totalVisits: m.ros.size
  }));

  result.sort((a, b) => b.totalVisits - a.totalVisits);

  return result[0] || null;

};


// ============================
// Top N model xe sửa nhiều nhất
// ============================
exports.getTopCarByCounts = function(list, top = 5) {

  const modelMap = {};

  list.forEach(item => {

    const model = item.TradeMarkNameModel || "Unknown";

    if (!modelMap[model]) {
      modelMap[model] = {
        plates: new Set(),
        ros: new Set()
      };
    }

    modelMap[model].plates.add(item.PlateNo);
    modelMap[model].ros.add(item.RONo);

  });

  const result = Object.entries(modelMap).map(([model, data]) => ({
    model,
    totalCars: data.plates.size,
    totalVisits: data.ros.size
  }));

  return result
    .sort((a, b) => b.totalVisits - a.totalVisits)
    .slice(0, top);

};