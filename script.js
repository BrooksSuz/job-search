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
      const { baseUrl, uniName, ...configPairs } = config;

      const stopSpinner = showSpinner();
      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      const arrScrapedJobs = await scrapeJobs(page, configPairs);

      stopSpinner();
      console.log('\x1b[35m%s\x1b[0m', `\nRESULTS FOR ${uniName}:`);

      arrScrapedJobs.forEach((objScrapedJob) => {
        const [[strKey, strValue]] = Object.entries(objScrapedJob);
        arrDesiredJobs.push(`\n${strKey}:\n${strValue}`);
      });

      arrDesiredJobs.forEach((job) => console.log('\x1b[32m%s\x1b[0m', job));
    } catch (err) {
      console.error(`\nError with config ${config.uniName}:\n`, err);
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
