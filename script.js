import puppeteer from 'puppeteer';
import scrapeJobs from './functions.js';
import jobSearchConfigs from './job-search-configs.js';

const runScrapingTasks = async () => {
  const browser = await puppeteer.launch();
  for (const config of jobSearchConfigs) {
    const page = await browser.newPage();
    await scrapeJobs(page, config);
    await page.close();
  }

  await browser.close();
};

runScrapingTasks();
