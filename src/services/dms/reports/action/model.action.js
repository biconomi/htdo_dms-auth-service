
// theo model xe
// Doanh thu theo model xe giảm dần
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
        totalAmount: 0,
        totalVAT: 0,
        totalSumAmount: 0
      };
    }

    modelMap[model].plates.add(item.PlateNo);
    modelMap[model].totalAmount += amount;
    modelMap[model].totalVAT += vat;
    modelMap[model].totalSumAmount += sum;

  });

  const result = Object.values(modelMap).map(m => ({
    model: m.model,
    totalCars: m.plates.size,
    totalAmount: Math.round(m.totalAmount),
    totalVAT: Math.round(m.totalVAT),
    totalSumAmount: Math.round(m.totalSumAmount)
  }));

  // sort doanh thu giảm dần
  result.sort((a, b) => b.totalSumAmount - a.totalSumAmount);

  return result;

};

// Lấy model xe có doanh thu cao nhất
exports.getTopRevenueCarModel = function(list) {

  const models = exports.getRevenueByCarModel(list);

  if (!models.length) return null;

  return models[0];

};

// Lấy model xe có doanh thu thấp nhất
exports.getLowestRevenueCarModel = function(list) {

  const models = exports.getRevenueByCarModel(list);

  if (!models.length) return null;

  return models[models.length - 1];

};
// Lấy model xe có số lượng sửa chữa nhiều nhất
exports.getTopCarByCount = function(list) {

  const modelMap = {};

  list.forEach(item => {

    const model = item.TradeMarkNameModel || "Unknown";

    if (!modelMap[model]) {
      modelMap[model] = {
        model,
        plates: new Set()
      };
    }

    modelMap[model].plates.add(item.PlateNo);

  });

  const result = Object.values(modelMap).map(m => ({
    model: m.model,
    totalCars: m.plates.size
  }));

  result.sort((a, b) => b.totalCars - a.totalCars);

  return result[0] || null;
}; 
// Lấy top 5 model xe có số lượng sửa chữa nhiều nhất
exports.getTopCarByCounts = function(list, top = 5) {

  const modelMap = {};

  list.forEach(item => {

    const model = item.TradeMarkNameModel || "Unknown";

    if (!modelMap[model]) {
      modelMap[model] = new Set();
    }

    modelMap[model].add(item.PlateNo);

  });

  const result = Object.entries(modelMap).map(([model, plates]) => ({
    model,
    totalCars: plates.size
  }));

  return result
    .sort((a, b) => b.totalCars - a.totalCars)
    .slice(0, top);

};