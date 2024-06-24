import puppeteer from 'puppeteer';

const url = 'https://careers.utoledo.edu/cw/en-us/listing/';

const goFunction = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);
  await page.setViewport({ width: 1080, height: 1024 });

  // Recursively click "More Jobs" button until it is no longer on the page
  const clickButtonRecursively = async (selector) => {
    try {
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView();
        }
      }, selector);
      await page.waitForSelector(selector);
      await page.click(selector);

      console.log('Button clicked');
      await page.waitForTimeout(1000);
      await clickButtonRecursively(selector);
    } catch (err) {
      console.log('Button not found, stopping recursion');
    }
  };

  const anchorMoreJobs = '.more-link';

  await clickButtonRecursively(anchorMoreJobs);
  await browser.close();
};

goFunction();
