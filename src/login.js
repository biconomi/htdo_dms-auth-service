const { chromium } = require("playwright");

async function loginDMS() {

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(
    "https://account.hyundai.thanhcong.vn/Account/Login/CARSERVICE?ReturnUrl=https://dmscarservice.hyundai.thanhcong.vn/login"
  );

  await page.fill('#Identity', process.env.DMS_USERNAME);
  await page.fill('#Password', process.env.DMS_PASSWORD);
  await page.click('input[type="submit"]');

  await page.waitForLoadState('networkidle', { timeout: 60000 });

  console.log("Final URL:", page.url());

  const storage = await page.evaluate(() => ({ ...localStorage }));
  console.log("LOCAL STORAGE:", storage);

  const token = storage.token_dmservice || null;

  await browser.close();

  return token;
}

module.exports = loginDMS;