import puppeteer from 'puppeteer';

async function scrapeJobs({
	url,
	btnConsentSelector,
	searchTerms,
	jobTitleSelector,
	nextPageSelector,
	nextPageDisabledClass,
}) {
	// Launch a new browser instance
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	// Navigate to the specified URL
	await page.goto(url, { waitUntil: 'networkidle0' });

	const arrDesiredJobs = []; // Array to store job titles and links that match the search terms
	let hasMorePages = true; // Flag to control pagination

	// Click the consent button if it exists and is defined in the config
	try {
		await page.waitForSelector(btnConsentSelector, { timeout: 30000 });
		await page.click(btnConsentSelector);
		console.log('Consent button clicked.');
	} catch (err) {
		console.log('Consent button not found');
	}

	// Function to process and scrape job listings on the current page
	const processJobListings = async () => {
		// Get all job elements matching the provided job title selector
		const jobElements = await page.$$(jobTitleSelector);

		// Iterate through each job element and evaluate the text and link
		await Promise.all(
			jobElements.map(async (jobElement) => {
				const jobTextContent = await page.evaluate(
					(el) => el.textContent,
					jobElement
				);

				// Convert job text to lowercase for case-insensitive search
				const lowerCaseJobText = jobTextContent.toLowerCase();

				// Check if any of the search terms match (case-insensitive)
				if (
					searchTerms.some(
						(term) =>
							lowerCaseJobText.includes(term.toLowerCase()) ||
							term.toLowerCase().includes(lowerCaseJobText)
					)
				) {
					// Get the href of the job element
					const jobHref = await page.evaluate((el) => el.href, jobElement);

					// Capitalize the first letter of each word for the final display
					const preferredCaseJobText = jobTextContent
						.toLowerCase()
						.replace(/\b\w/g, (char) => char.toUpperCase());

					// Add the formatted job title and URL to the result array
					arrDesiredJobs.push(`${preferredCaseJobText.trim()}: ${jobHref}`);
					console.log(arrDesiredJobs);
				}
			})
		);
	};

	// Function to handle pagination by clicking the "Next Page" button
	const clickNextPage = async () => {
		const previousUrl = page.url();

		// TODO: I'm not sure if the following guard clause works as intended, since if this times out, it'll just throw an error

		// Locate the next page button
		const btnNextPage = await page.waitForSelector(nextPageSelector, {
			timeout: 10000,
		});

		if (!btnNextPage) {
			console.log('Next page button not found.');
			hasMorePages = false;
			return;
		}

		// TODO: For whatever reason, isDisabled is logging undefined

		// Check if the button is disabled via class or attribute
		const isDisabled = await page.evaluate(
			(el, disabledClass) =>
				el.classList.contains(disabledClass) ||
				el.hasAttribute('disabled') ||
				el.disabled,
			btnNextPage,
			nextPageDisabledClass
		);

		const noHref = await page.evaluate((el) => !el.href, btnNextPage);

		console.log(`isDisabled: ${isDisabled}`);
		console.log(`Href is empty: ${noHref}`);

		// Stop pagination if the button is disabled or lacks an href
		if (isDisabled || noHref) {
			console.log('Next page button is disabled or has no href. Exiting loop.');
			hasMorePages = false;
			return;
		}

		// Otherwise, click and wait for the next page to load
		console.log('Navigating to the next page...');
		await Promise.all([
			btnNextPage.click(),
			page.waitForNavigation({ waitUntil: 'networkidle0' }),
		]);

		// Ensure that the URL has changed
		await page.waitForFunction(
			(prevUrl) => window.location.href !== prevUrl,
			{},
			previousUrl
		);
	};

	try {
		while (hasMorePages) {
			await processJobListings();
			await clickNextPage();
		}
	} catch (error) {
		console.error('Error during pagination:', error);
		hasMorePages = false;
	}

	// Output the collected job listings to the console
	console.log(arrDesiredJobs);

	// Close the browser when done
	await browser.close();
}

// Example configurations
const emichJobSearchConfig = {
	url: 'https://careers.emich.edu/jobs/search',
	btnConsentSelector: 'button#consent_agree',
	searchTerms: ['Visiting Faculty'],
	jobTitleSelector: 'a[id^="link_job_title"]',
	nextPageSelector: 'li.next_page > a',
	nextPageDisabledClass: 'disabled',
};

const umichJobSearchConfig = {
	url: 'https://careers.umich.edu/browse-jobs/positions/F',
	btnConsentSelector: null, // Assuming there's no consent button
	searchTerms: ['Administrative Specialist', 'Patient Care Tech Associate'],
	jobTitleSelector: 'table.cols-5 td.views-field-title > a',
	nextPageSelector: "a[title='Go to next page']",
	nextPageDisabledClass: 'disabled',
};

// Example usage of scrapeJobs function with different configurations
(async () => {
	const arrUserSelections = [emichJobSearchConfig];

	for (const selection of arrUserSelections) {
		await scrapeJobs(selection);
	}
})();
