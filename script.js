import scrapeJobs from './functions.js';
import jobSearchConfigs from './job-search-configs.js';

const runScrapingTasks = async () => {
  for (const config of jobSearchConfigs) {
    await scrapeJobs(config);
  }
};

runScrapingTasks();
