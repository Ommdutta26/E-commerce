const Redis = require("ioredis");
const client = new Redis(process.env.UPSTASH_REDIS_URL);

async function testRedis() {
  try {
    await client.set('foo', 'bar');
    console.log("Value set in Redis");
  } catch (error) {
    console.error("Redis error:", error);
  }
}

testRedis();

module.exports =  client ;
