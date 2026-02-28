const fs = require("fs");
const path = require("path");

const CACHE_FILE = path.join(__dirname, "cache.json");

function readCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

function writeCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
}

module.exports = {
  async get(key) {
    const cache = readCache();
    const item = cache[key];

    if (!item) return null;

    if (Date.now() > item.expireAt) {
      delete cache[key];
      writeCache(cache);
      return null;
    }

    return item.value;
  },

  async set(key, value, ttlSeconds) {
    const cache = readCache();
    cache[key] = {
      value,
      expireAt: Date.now() + ttlSeconds * 1000
    };
    writeCache(cache);
  },

  async del(key) {
    const cache = readCache();
    delete cache[key];
    writeCache(cache);
  }
};