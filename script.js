import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

// TODO: You were having issues trying to make this run in parallel.
// Figure out how to do this.

// TODO: U Mich doesn't grab things from the final page. Fix this.

// Utoledo doesn't navigate at all :,(

async function runScrapingTasks() {
  const browser = await puppeteer.launch({ headless: false });

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
      console.log('\x1b[35m%s\x1b[0m', `\nRESULTS FOR ${settings.uniName}:`);

      arrScrapedJobs.forEach((objScrapedJob) => {
        const [[strKey, strValue]] = Object.entries(objScrapedJob);
        arrDesiredJobs.push(`\n${strKey}:\n${strValue}`);
      });

      arrDesiredJobs.forEach((job) => console.log('\x1b[32m%s\x1b[0m', job));
    } catch (err) {
      console.log(`\nError with config ${settings.uniName}:\n${err}`);
    } finally {
      // await page.close();
    }
  }

  // await browser.close();
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
