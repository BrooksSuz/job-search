import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

async function newFunc(searchTerms = ['assis']) {
	const parallelConfigs = [];
	const sequentialConfigs = [];
	const stopSpinner = showSpinner();

	// Separate configs into parallel and sequential
	configs.forEach((config) => {
		if (config.canRunParallel) {
			parallelConfigs.push(config);
		} else {
			sequentialConfigs.push(config);
		}
	});

	// Run parallel tasks
	try {
		await Promise.all(
			parallelConfigs.map(async (config) => {
				const browser = await puppeteer.launch();
				try {
					await runScrapingTasks(config, browser, searchTerms);
				} finally {
					await browser.close();
				}
			})
		);
	} catch (err) {
		console.error('Error in parallel tasks:', err);
	}

	// Run sequential tasks
	for (const config of sequentialConfigs) {
		const browser = await puppeteer.launch();
		try {
			await runScrapingTasks(config, browser, searchTerms);
		} catch (err) {
			console.error(`Error in sequential task for config: ${config.url}`, err);
		} finally {
			await browser.close();
		}
	}

	stopSpinner();
}

async function runScrapingTasks(config, browser, searchTerms) {
	const arrDesiredJobs = [];
	const page = await browser.newPage();

	try {
		const { baseUrl, uniName, ...configPairs } = config;
		await page.goto(baseUrl, { waitUntil: 'networkidle0' });
		const arrScrapedJobs = await scrapeJobs(page, searchTerms, configPairs);
		console.log('\x1b[35m%s\x1b[0m', `\nRESULTS FOR ${uniName}:`);

		arrScrapedJobs.forEach((objScrapedJob) => {
			const [[strKey, strValue]] = Object.entries(objScrapedJob);
			const strJobs = `\n${strKey}:\n${strValue}`;
			const alreadyIncluded = !arrDesiredJobs.includes(strJobs);

			// Don't include duplicates
			if (alreadyIncluded) {
				arrDesiredJobs.push(`\n${strKey}:\n${strValue}`);
			}
		});

		arrDesiredJobs.forEach((job) => console.log('\x1b[32m%s\x1b[0m', job));
	} catch (err) {
		console.error(`\nError with config ${config.uniName}:\n`, err);
	}
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

newFunc();
