const callDms = require('../../dms/dms.client');

exports.getQuotationDetail = async (keyNo) => {

  const roInfo = await callDms('/SerRO/GetByKeyNoDL', {
    SearchType: 'QUATATION_NO',
    KeyNo: keyNo,
    FlagWH: '0'
  });

  if (roInfo === false) {
    throw new Error('Token expired');
  }

  const roList = roInfo?.Data?._objResult?.Data?.Lst_Ser_RO;

  if (!Array.isArray(roList) || roList.length === 0) {
    throw new Error('Không tìm thấy RO từ KeyNo');
  }

  const { ROID, CusID, CarID, MemberNo } = roList[0];

  const [detailRes, moreInfoRes] = await Promise.all([
    callDms('/SerRO/GetByROIDDL', { ROID }),
    callDms('/SerRO/CheckAndGetMoreInfor', {
      ROID,
      CusID,
      CarID,
      MemberNo
    })
  ]);

  return {
    raw: {
      roInfoRaw: roInfo,
      detailRaw: detailRes,
      moreInfoRaw: moreInfoRes
    },
    calculated: mapQuotationResponse(detailRes, moreInfoRes)
  };
};

function mapQuotationResponse(detailRes, moreInfoRes) {

  const raw = detailRes?.Data?._objResult?.Data;
  const ro = raw?.Lst_Ser_RO?.[0] || {};
  const servicesRaw = raw?.Lst_Ser_ROServiceItems || [];
  const partsRaw = raw?.Lst_Ser_ROPartItems || [];

  const round = (v) => Math.round(Number(v) || 0);

  // ============================
  // 🔧 SERVICES
  // ============================

  const services = servicesRaw.map((s, index) => {

    const qty = Number(s.ActManHour || s.StdManHour || 0);
    const price = Number(s.Price || 0);
    const factor = Number(s.Factor ?? 1);
    const vatRate = Number(s.VAT || 0);

    const amountBeforeVAT = round(qty * price * factor);
    const vatAmount = round(amountBeforeVAT * vatRate / 100);
    const total = round(amountBeforeVAT + vatAmount);

    return {
      no: index + 1,
      SerCode: s.SerCode,
      SerName: s.SerName,
      Unit: "Giờ",
      Qty: qty,
      Price: price,
      StdManHour: s.StdManHour,
      Factor: factor,
      VAT: vatRate,
      AmountBeforeVAT: amountBeforeVAT,
      VATAmount: vatAmount,
      Total: total
    };
  });

  // ============================
  // 🔩 PARTS
  // ============================

  const parts = partsRaw.map((p, index) => {

    const qty = Number(p.Need || 0);
    const price = Number(p.Price || 0);
    const factor = Number(p.Factor ?? 1);
    const vatRate = Number(p.VAT || 0);

    const amountBeforeVAT = round(qty * price * factor);
    const vatAmount = round(amountBeforeVAT * vatRate / 100);
    const total = round(amountBeforeVAT + vatAmount);

    return {
      no: index + 1,
      PartCode: p.PartCode,
      PartName: p.VieName,
      Unit: p.Unit,
      Qty: qty,
      Price: price,
      Need: p.Need,
      Factor: factor,
      VAT: vatRate,
      ROType: p.ROType,
      EngineerName: p.EngineerName,
      GroupRID: p.GroupRID,
      GroupRName: p.GroupRName,
      AmountBeforeVAT: amountBeforeVAT,
      VATAmount: vatAmount,
      Total: total
    };
  });

  // ============================
  // 💰 PAYMENT SUMMARY
  // ============================

  const totalServiceBeforeVAT = services.reduce((a, b) => a + b.AmountBeforeVAT, 0);
  const totalPartBeforeVAT = parts.reduce((a, b) => a + b.AmountBeforeVAT, 0);

  const totalBeforeVAT = round(totalServiceBeforeVAT + totalPartBeforeVAT);

  const totalVAT = round(
    services.reduce((a, b) => a + b.VATAmount, 0) +
    parts.reduce((a, b) => a + b.VATAmount, 0)
  );

  const totalAfterVAT = round(totalBeforeVAT + totalVAT);

  // Nếu có AmountFromMC (bảo hiểm)
  const insurancePay = Number(ro.AmountFromMC || 0);
  const customerPay = round(totalAfterVAT - insurancePay);

  return {

    // ============================
    // 👤 CUSTOMER INFO
    // ============================

    customer: {
      CusName: ro.CusName,
      CusAddress: ro.CusAddress,
      CusMobile: ro.CusMobile,
      IDCardNo: ro.IDCardNo,
      MemberNo: ro.MemberNo,
      CusRequest: ro.CusRequest
    },

    // ============================
    // 🚗 CAR INFO
    // ============================

    car: {
      PlateNo: ro.PlateNo,
      ModelName: ro.ModelName,
      FrameNo: ro.FrameNo,
      EngineNo: ro.EngineNo,
      ColorCode: ro.ColorCode,
      Km: ro.Km,
      WarrantyKM: ro.WarrantyKM,
      WarrantyExpiresDate: ro.WarrantyExpiresDate,
      CheckInDate: ro.CheckInDate
    },

    // ============================
    // 🔧 SERVICES
    // ============================

    services,

    // ============================
    // 🔩 PARTS
    // ============================

    parts,

    // ============================
    // 💳 PAYMENT
    // ============================

    payment: {
      TotalServiceBeforeVAT: totalServiceBeforeVAT,
      TotalPartBeforeVAT: totalPartBeforeVAT,
      TotalBeforeVAT: totalBeforeVAT,
      TotalVAT: totalVAT,
      TotalAfterVAT: totalAfterVAT,
      InsurancePay: insurancePay,
      CustomerPay: customerPay
    }
  };
}