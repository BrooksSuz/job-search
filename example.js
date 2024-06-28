import puppeteer from 'puppeteer';

const url = 'https://careers.utoledo.edu/cw/en-us/listing/';

const goFunction = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);

  const btnMore = await page.locator('.more-link').waitHandle();
  const btnMoreTextContent = await btnMore?.evaluate((el) => el.textContent);
  console.log(btnMoreTextContent);
  await page.click(btnMore);
  setTimeout(() => {}, 10000);
  await browser.close();
};

goFunction();
