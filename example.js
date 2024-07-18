import puppeteer from 'puppeteer';

const url = 'https://example.com/';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);

  const href1 = 'https://www.iana.org/domains/example';
  const anchorTextContent1 = await page.evaluate((href) => {
    return document.querySelector(`a[href='${href}']`).textContent;
  }, href1);

  console.log(anchorTextContent1);

  const anchorClick1 = await page.evaluate((href1) => {
    const anchor = document.querySelector(`a[href='${href1}']`);

    if (anchor) {
      anchor.click();
      return 'First anchor clicked.';
    }

    return '';
  }, href1);

  if (!anchorClick1) await browser.close();

  console.log(anchorClick1);

  await browser.close();
})();
