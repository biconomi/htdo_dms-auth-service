const { chromium } = require("playwright");

async function loginDMS() {

  const context = await chromium.launchPersistentContext('./user-data', {
  headless: true,   // 👈 bắt buộc trong Docker
  slowMo: 50,
  args: ['--no-sandbox']
  });
  const page = await context.newPage();

  await page.goto(
    "https://account.hyundai.thanhcong.vn/Account/Login/CARSERVICE?ReturnUrl=https://dmscarservice.hyundai.thanhcong.vn/login"
  );

  await page.fill('#Identity', process.env.DMS_USERNAME);
  await page.fill('#Password', process.env.DMS_PASSWORD);
  await page.click('input[type="submit"]');

  // 🔥 Chờ về đúng domain gốc (không phải /login)
  await page.waitForURL("**dmscarservice.hyundai.thanhcong.vn/**", {
    timeout: 60000
  });

  await page.waitForTimeout(8000);

  console.log("Final URL:", page.url());

  const storage = await page.evaluate(() => ({ ...localStorage }));
  console.log("LOCAL STORAGE:", storage);

  const token = storage.token_dmservice || null;

  console.log("🔥 TOKEN:", token);

  await context.close();

  return token;
}

module.exports = loginDMS;