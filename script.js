import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

// TODO: You were having issues trying to make this run in parallel.
// Figure out how to do this.

async function runScrapingTasks() {
  const browser = await puppeteer.launch();

  for (const config of configs) {
    const arrDesiredJobs = [];
    const page = await browser.newPage();
    try {
      const { urlInfo, selectors, settings } = config;

      const stopSpinner = showSpinner();
      await page.goto(urlInfo.baseUrl, { waitUntil: 'networkidle0' });

      const arrScrapedJobs = await scrapeJobs(
        page,
        ...Object.values(selectors),
        ...Object.values(settings)
      );

      stopSpinner();
      console.log(`\nRESULTS FOR ${settings.uniName}:`);

      arrScrapedJobs.forEach((objScrapedJob) => {
        const [[strKey, strValue]] = Object.entries(objScrapedJob);
        arrDesiredJobs.push(`\n${strKey}:\n${strValue}`);
      });

      arrDesiredJobs.forEach((job) => console.log(job));
    } catch (err) {
      console.log(`\nError with config ${settings.uniName}:\n${err}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

const showSpinner = () => {
  const spinnerChars = ['|', '/', '-', '\\'];
  let i = 0;

  const spinnerInterval = setInterval(() => {
    process.stdout.write(`\r${spinnerChars[i]} Scraping...`);
    i = (i + 1) % spinnerChars.length;
  }, 100);

  return () => clearInterval(spinnerInterval);
};

runScrapingTasks();
