const { createClient } = require("redis");

let client;

async function getClient() {
  if (!client) {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      },
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      database: process.env.REDIS_DB
    });

    client.on("error", (err) => {
      console.error("Redis Error:", err.message);
    });

    await client.connect();
    console.log("Redis connected");
  }

  return client;
}

module.exports = {
  async get(key) {
    const c = await getClient();
    return await c.get(key);
  },

  async set(key, value, ttlSeconds) {
    const c = await getClient();
    await c.set(key, value, { EX: ttlSeconds });
  },

  async del(key) {
    const c = await getClient();
    await c.del(key);
  }
};