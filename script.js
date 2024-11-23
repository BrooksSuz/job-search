import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

async function runScript(searchTerms = ['instru', 'prof'], index = 0) {
	// Start console spinner
	const stopSpinner = showSpinner();

	// Initialize the browser
	const browser = await puppeteer.launch();

	// Create a new page
	const page = await browser.newPage();

	const currentConfig = configs[index];
	const hasAnotherConfig = index < configs.length - 1;

	try {
		await runScrapingTasks(currentConfig, page, searchTerms);
	} catch (err) {
		console.error('\nError in function run:\n\n', err);
	} finally {
		stopSpinner();
	}

	if (hasAnotherConfig) runScript(searchTerms, ++index);
	await browser.close();
}

const runScrapingTasks = async (currentConfig, page, searchTerms) => {
	const { baseUrl, uniName, ...configPairs } = currentConfig;
	const objScrapeJobs = { page, searchTerms, configPairs };
	const arrDesiredJobs = [];

	try {
		await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: '60000' });
		const arrScrapedJobs = await scrapeJobs(objScrapeJobs);
		console.log('\x1b[35m%s\x1b[0m', `RESULTS FOR ${uniName}:`);

		arrScrapedJobs.forEach((objScrapedJob) => {
			const [[strKey, strValue]] = Object.entries(objScrapedJob);
			const strJobs = `\n${strKey}:\n${strValue}`;
			const alreadyIncluded = !arrDesiredJobs.includes(strJobs);

			// Don't include duplicates
			if (alreadyIncluded) {
				arrDesiredJobs.push(strJobs);
			}
		});

		arrDesiredJobs.forEach((job) => console.log('\x1b[32m%s\x1b[0m', job));
	} catch (err) {
		console.error(`\nError in function runScrapingTasks:\n\n${err}`);
	} finally {
		page.close();
	}
};

const showSpinner = () => {
	const spinnerChars = ['|', '/', '-', '\\'];
	let i = 0;

	const spinnerInterval = setInterval(() => {
		process.stdout.write(`\r${spinnerChars[i]}`);
		i = (i + 1) % spinnerChars.length;
	}, 100);

	return () => clearInterval(spinnerInterval);
};

runScript();
