const cache = require("../../cache/cache.factory");
const loginDMS = require("../../login/login");

const TOKEN_KEY = "DMS_ACCESS_TOKEN";
const TOKEN_TTL = 60 * 60 * 6; // 6 tiếng

exports.getToken = async () => {
  const cachedToken = await cache.get(TOKEN_KEY);

  if (cachedToken) {
    console.log("Lấy token từ cache");
    return cachedToken;
  }

  console.log("Login lấy token mới...");
  const newToken = await loginDMS();

  if (!newToken) {
    throw new Error("Login DMS thất bại");
  }

  await cache.set(TOKEN_KEY, newToken, TOKEN_TTL);

  return newToken;
};

exports.resetToken = async () => {
  const newToken = await loginDMS();

  if (!newToken) {
    throw new Error("Login DMS thất bại khi reset");
  }

  await cache.set(TOKEN_KEY, newToken, TOKEN_TTL);

  return newToken;
};