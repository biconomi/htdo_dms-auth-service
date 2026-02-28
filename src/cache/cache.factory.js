let cache;

const driver = process.env.CACHE_DRIVER || "file";

console.log("Cache driver:", driver);

switch (driver) {
  case "redis":
    cache = require("./redis.cache");
    break;

  case "file":
  default:
    cache = require("./file.cache");
    break;
}

module.exports = cache;