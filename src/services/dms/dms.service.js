const callDms = require("./dms.client");

exports.getByKeyNo = (keyNo, searchType) => {
  return callDms("/SerRO/GetByKeyNoDL", {
    SearchType: searchType,
    KeyNo: keyNo,
    FlagWH: "0"
  });
};

