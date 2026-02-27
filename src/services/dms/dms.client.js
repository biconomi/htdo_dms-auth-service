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
    "Authorization": `Bearer ${token}`,
    "AppAgent": "Web-CarService",
    "AppLanguageCode": "vi",
    "AppTid": crypto.randomUUID(),
    "AppVerCode": "V1",
    "DealerCode": "HTV",
    "GwUserCode": "idocNet.idn.CarService.Sv",
    "GwPassword": "idocNet.idn.CarService.Sv",
    "NetworkId": "9507499001",
    "OrgId": "9507499001",
    "Tid": crypto.randomUUID(),
    "UtcOffset": 7
  };
}

// detect token chết trong body
function isDmsUnauthorized(data) {
  const errors = data?.Data?._dicExcs?.Lst_c_K_DT_SysError || [];
  return errors.some(
    e => e.PCode === "excSE.ErrorCode" && e.PVal === "Unauthorize"
  );
}

async function callDms(endpoint, bodyParams) {
  let token = await tokenService.getToken();
  console.log("Token:", token);
  console.log("Calling DMS:", endpoint, bodyParams);
  const params = new URLSearchParams();
  Object.keys(bodyParams).forEach(key =>
    params.append(key, bodyParams[key])
  );

  const doRequest = async (tk) => {
    return axios.post(
      `${BASE_URL}${endpoint}`,
      params.toString(),
      {
        headers: buildHeaders(tk),
        httpsAgent
      }
    );
  };

  let response = await doRequest(token);

  // Nếu token chết trong body
  if (isDmsUnauthorized(response.data)) {
    console.log("Token expired → login lại");
    // token = await tokenService.resetToken();
    // response = await doRequest(token);
  }

  return response.data;
}

module.exports = callDms;