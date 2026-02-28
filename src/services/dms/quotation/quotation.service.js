const callDms = require('../../dms/dms.client');

exports.getQuotationDetail = async (keyNo) => {
    console.log('Tiến hành láy thông tin báo giá từ DMS với keyNo:', keyNo);
//   1️⃣ Lấy thông tin RO
    const roInfo = await callDms('/SerRO/GetByKeyNoDL', {
        SearchType: 'QUATATION_NO',
        KeyNo: keyNo,
        FlagWH: '0'
    }); 

    if(roInfo===false) {
        throw new Error('Token expired');
    }
    const roList = roInfo?.Data?._objResult?.Data?.Lst_Ser_RO;

    if (!Array.isArray(roList) || roList.length === 0) {
        throw new Error('Không tìm thấy RO từ KeyNo');
    }
    const roId = roList[0].ROID;
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

  return mapQuotationResponse(detailRes, moreInfoRes);
};
function mapQuotationResponse(detailRes) {

  const raw = detailRes?.Data?._objResult?.Data;
  const ro = raw?.Lst_Ser_RO?.[0] || {};
  const servicesRaw = raw?.Lst_Ser_ROServiceItems || [];
  const partsRaw = raw?.Lst_Ser_ROPartItems || [];

  const formatDateTime = (d) =>
    d ? new Date(d).toISOString() : null;

  // =============================
  // 🔧 SERVICES
  // =============================

  const services = servicesRaw.map((s, index) => {
    const qty = s.ActManHour || s.StdManHour || 0;
    const price = s.Price || 0;
    const vatRate = s.VAT || 0;

    const amount = qty * price;
    const vatAmount = amount * vatRate / 100;
    const total = amount + vatAmount;

    return {
      no: index + 1,
      code: s.SerCode,
      name: s.SerName,
      unit: "Giờ",
      qty,
      price,
      amount,
      vatRate,
      vatAmount,
      total
    };
  });

  // =============================
  // 🔩 PARTS
  // =============================

  const parts = partsRaw.map((p, index) => {
    const qty = p.Need || 0;
    const price = p.Price || 0;
    const vatRate = p.VAT || 0;

    const amount = qty * price;
    const vatAmount = amount * vatRate / 100;
    const total = amount + vatAmount;

    return {
      no: index + 1,
      code: p.PartCode,
      name: p.VieName,
      unit: p.Unit,
      qty,
      price,
      amount,
      vatRate,
      vatAmount,
      total
    };
  });

  // =============================
  // 💰 SUMMARY
  // =============================

  const serviceAmount = services.reduce((a, b) => a + b.amount, 0);
  const partAmount = parts.reduce((a, b) => a + b.amount, 0);
  const totalBeforeVAT = serviceAmount + partAmount;

  const totalVAT =
    services.reduce((a, b) => a + b.vatAmount, 0) +
    parts.reduce((a, b) => a + b.vatAmount, 0);

  const grandTotal = totalBeforeVAT + totalVAT;

  return {
    header: {
      quotationNo: ro.RONo
    },

    customer: {
      customerName: ro.CusName,
      customerAddress: ro.CusAddress,
      customerPhone: ro.CusMobile,
      customerIdCard: ro.IDCardNo,
      memberNo: ro.MemberNo,
      customerRequest: ro.CusRequest   // ✅ thêm yêu cầu khách
    },

    car: {
      plateNo: ro.PlateNo,
      model: ro.ModelName,
      frameNo: ro.FrameNo,
      engineNo: ro.EngineNo,
      color: ro.ColorCode,
      km: ro.Km,
      warrantyKM: ro.WarrantyKM,
      warrantyExpireDate: formatDateTime(ro.WarrantyExpiresDate),
      checkInDate: formatDateTime(ro.CheckInDate)  // ✅ thêm thời gian vào
    },

    services,
    parts,

    summary: {
      serviceAmount,
      partAmount,
      totalBeforeVAT,
      totalVAT,
      grandTotal,
      grandTotalText: ''
    }
  };
}