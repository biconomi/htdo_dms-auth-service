const axios = require("axios");
const https = require("https");
const crypto = require("crypto");
const tokenService = require("./token.service");

const httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
});

const BASE_URL =
  "https://dmscarserviceapi.hyundai.thanhcong.vn/idocNet.HTV.CarService.ClientGate.9507499001.WA";

function buildHeaders(token) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${token}`,
    AppAgent: "Web-CarService",
    AppLanguageCode: "vi",
    AppTid: crypto.randomUUID(),
    AppVerCode: "V1",
    DealerCode: "HTV",
    GwUserCode: "idocNet.idn.CarService.Sv",
    GwPassword: "idocNet.idn.CarService.Sv",
    NetworkId: "9507499001",
    OrgId: "9507499001",
    Tid: crypto.randomUUID(),
    UtcOffset: 7
  };
}

function isDmsUnauthorized(data) {
  const errors = data?.Data?._dicExcs?.Lst_c_K_DT_SysError || [];
  return errors.some(
    e => e.PCode === "excSE.ErrorCode" && e.PVal === "Unauthorize"
  );
}

async function callDms(endpoint, bodyParams) {
  try {
    let token = await tokenService.getToken();

    const doRequest = async (tk) => {
      const params = new URLSearchParams();
      Object.keys(bodyParams || {}).forEach(key => {
        if (bodyParams[key] !== undefined && bodyParams[key] !== null) {
          params.append(key, bodyParams[key]);
        }
      });

      return axios.post(
        `${BASE_URL}${endpoint}`,
        params.toString(),
        {
          headers: buildHeaders(tk),
          httpsAgent,
          timeout: 20000 // ⏱ 20s timeout
        }
      );
    };

    let response = await doRequest(token);

    // Nếu token chết trong body → refresh và retry 1 lần
    if (isDmsUnauthorized(response.data)) {
      console.log("Token expired → refresh lại");

      token = await tokenService.resetToken();

      response = await doRequest(token);

      if (isDmsUnauthorized(response.data)) {
        throw new Error("DMS Unauthorized after retry");
      }
    }

    return response.data;

  } catch (error) {
    console.error("DMS CALL ERROR:", {
      endpoint,
      message: error.message
    });

    throw error; // để service layer xử lý tiếp
  }
}

module.exports = callDms;