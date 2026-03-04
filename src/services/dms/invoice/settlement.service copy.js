const callDms = require('../dms.client');

exports.settlementInvoice = async (keyNo) => {
  console.log('Tiến hành láy thông tin quyết toán từ DMS với keyNo:', keyNo);
  const roInfo = await callDms('/SerRO/GetByKeyNoDL', {
    SearchType: 'QUATATION_NO',
    KeyNo: keyNo,
    FlagWH: '0'
  });

  if (roInfo === false) throw new Error('Token expired');

  const roList = roInfo?.Data?._objResult?.Data?.Lst_Ser_RO;

  if (!Array.isArray(roList) || roList.length === 0) {
    throw new Error('Không tìm thấy RO từ KeyNo');
  }

  const { ROID, CusID, CarID, MemberNo, Status} = roList[0];
  // console.log(`ROID: ${ROID}, CusID: ${CusID}, CarID: ${CarID}, MemberNo: ${MemberNo}, Status: ${Status}`);
  // ✅ Chỉ cho phép CEND hoặc FNS
  const allowedStatus = ['CEND', 'FNS','PAID'];

  if (!allowedStatus.includes(Status)) {
    throw new Error('RO chưa kết lệnh, không thể lấy thông tin quyết toán');
  }
  const [detailRes, moreInfoRes, cardRes] = await Promise.all([
    callDms('/SerRO/GetByROIDDL', { ROID }),
    callDms('/SerRO/CheckAndGetMoreInfor', { ROID, CusID, CarID, MemberNo }),
    callDms('/SerRO/GetCardForInvoiceDL', { ROID })
  ]);
  // return roInfo;
  return buildSettlementResponse(roInfo, detailRes, moreInfoRes, cardRes);
};

function buildSettlementResponse(roInfo, detailRes, moreInfoRes, cardRes) {

  const rawDetail = detailRes?.Data?._objResult?.Data;
  const ro = rawDetail?.Lst_Ser_RO?.[0] || {};
  const servicesRaw = rawDetail?.Lst_Ser_ROServiceItems || [];
  const partsRaw = rawDetail?.Lst_Ser_ROPartItems || [];

  const round = (v) => Math.round(Number(v) || 0);

  // ========================
  // SERVICES (GIỮ FULL RAW)
  // ========================

  const services = servicesRaw.map((s, index) => {

    const qty = Number(s.ActManHour || s.StdManHour || 0);
    const price = Number(s.Price || 0);
    const factor = Number(s.Factor ?? 1);
    const vatRate = Number(s.VAT || 0);

    const amountBeforeVAT = round(qty * price * factor);
    const vatAmount = round(amountBeforeVAT * vatRate / 100);
    const total = round(amountBeforeVAT + vatAmount);

    return {
      ...s, // 🔥 FULL RAW DMS

      // 🔥 BỔ SUNG FIELD TÍNH TOÁN
      __index: index + 1,
      __qtyUsed: qty,
      __factorUsed: factor,
      __amountBeforeVAT: amountBeforeVAT,
      __vatAmount: vatAmount,
      __total: total
    };
  });

  // ========================
  // PARTS (GIỮ FULL RAW)
  // ========================

  const parts = partsRaw.map((p, index) => {

    const qty = Number(p.Need || 0);
    const price = Number(p.Price || 0);
    const factor = Number(p.Factor ?? 1);
    const vatRate = Number(p.VAT || 0);

    const amountBeforeVAT = round(qty * price * factor);
    const vatAmount = round(amountBeforeVAT * vatRate / 100);
    const total = round(amountBeforeVAT + vatAmount);

    return {
      ...p, // 🔥 FULL RAW DMS

      // 🔥 BỔ SUNG FIELD TÍNH TOÁN
      __index: index + 1,
      __qtyUsed: qty,
      __factorUsed: factor,
      __amountBeforeVAT: amountBeforeVAT,
      __vatAmount: vatAmount,
      __total: total
    };
  });

  // ========================
  // SUMMARY
  // ========================

  const totalBeforeVAT = round(
    services.reduce((a, b) => a + b.__amountBeforeVAT, 0) +
    parts.reduce((a, b) => a + b.__amountBeforeVAT, 0)
  );

  const totalVAT = round(
    services.reduce((a, b) => a + b.__vatAmount, 0) +
    parts.reduce((a, b) => a + b.__vatAmount, 0)
  );

  const totalAfterVAT = round(totalBeforeVAT + totalVAT);

  const roList = roInfo?.Data?._objResult?.Data?.Lst_Ser_RO || [];

  const cardData = roList[0] || {};

  const amountFromCard = round(cardData.AmountFromMC || 0);

  const customerPay = round(totalAfterVAT - amountFromCard);
  return amountFromCard;
  return {
    raw: {
      roInfo,
      detailRes,
      moreInfoRes,
      // cardRes
    },

    calculated: {
      customer: ro,
      services,
      parts,
      payment: {
        totalBeforeVAT,
        totalVAT,
        totalAfterVAT,
        amountFromCard,
        customerPay
      }
    }
  };
}