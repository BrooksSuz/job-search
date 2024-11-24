import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

async function executeJobSearch(
	searchTerms = ['instru', 'prof', 'rn'],
	index = 0
) {
	// Start console spinner
	const stopSpinner = startSpinner();

	// Initialize the browser
	const browser = await puppeteer.launch({ headless: false });

	// Create a new page
	const page = await browser.newPage();

	// Get the current config
	const currentConfig = configs[index];

	// Wrap runScrapingTasks parameters into an object
	const runScrapingTasksParams = { currentConfig, page, searchTerms };

	try {
		await processJobScraping(runScrapingTasksParams);
	} catch (err) {
		console.error(`\nError in function runScrapingTasks:\n\n${err}`);
	} finally {
		stopSpinner();
	}

	// Check for another config
	const hasAnotherConfig = index < configs.length - 1;

	// Base case
	try {
		if (hasAnotherConfig) executeJobSearch(searchTerms, ++index);
	} finally {
		await browser.close();
	}
}

const processJobScraping = async (params) => {
	// Variables (destructured & normal)
	const { currentConfig, page, searchTerms } = params;
	const { baseUrl, uniName, ...configPairs } = currentConfig;
	const scrapeJobsParams = { page, searchTerms, configPairs };
	const arrDesiredJobs = [];

	try {
		// Navigate to the site
		await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: '60000' });

		// Scrape the listings
		const arrScrapedJobs = await scrapeJobs(scrapeJobsParams);

		// Log the config name
		console.log('\x1b[35m%s\x1b[0m', `RESULTS FOR ${uniName}:`);

		// Push listings into an array
		arrScrapedJobs.forEach((objScrapedJob) => {
			// Separate the keys and values
			const [[key, value]] = Object.entries(objScrapedJob);

			// Create the display string
			const strJobs = `\n${key}:\n${value}`;

			// Check for duplicates
			const alreadyIncluded = !arrDesiredJobs.includes(strJobs);

			// Don't include duplicates
			if (alreadyIncluded) arrDesiredJobs.push(strJobs);
		});

		// Log the results
		arrDesiredJobs.forEach((job) => {
			console.log('\x1b[32m%s\x1b[0m', job);
		});
	} catch (err) {
		console.error(`\nError in function runScrapingTasks:\n\n${err}`);
	} finally {
		page.close();
	}
};

const startSpinner = () => {
	const spinnerChars = ['|', '/', '-', '\\'];
	let i = 0;

	const spinnerInterval = setInterval(() => {
		process.stdout.write(`\r${spinnerChars[i]}`);
		i = (i + 1) % spinnerChars.length;
	}, 100);

	return () => clearInterval(spinnerInterval);
};

executeJobSearch();
