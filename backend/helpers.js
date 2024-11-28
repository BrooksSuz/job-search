import connectToDB from './db.js';

const scrapeJobs = async (scapeJobsParams) => {
	const { page, searchTerms, configPairs } = scapeJobsParams;
	const {
		canWaitForNavigation,
		consentButton,
		errMessages,
		isAnchor,
		jobTitleLink,
		nextPageDisabledClass,
		nextPageLink,
		nextPageParentSelector,
	} = configPairs;
	const checkConsentParams = { page, consentButton };
	const getJobsParams = { page, jobTitleLink, searchTerms };
	const navigateToNextPageParams = {
		page,
		canWaitForNavigation,
		errMessages,
		isAnchor,
		nextPageDisabledClass,
		nextPageLink,
		nextPageParentSelector,
	};

	// Check for a required consent button
	await checkConsent(checkConsentParams);

	// Create an array with jobs matching provided search terms
	const arrScrapedJobs = await getJobs(getJobsParams);

	// Recursively navigate each page
	await navigateSite(navigateToNextPageParams);

	// Get the jobs on the final page
	arrScrapedJobs.push(...(await getJobs(getJobsParams)));

	// Alphabetically sort the listings
	const sortedScrapedJobs = alphabetizeScrapedJobs(arrScrapedJobs);

	return sortedScrapedJobs;
};

const createAnchor = (listing) => {
	const [[title, url]] = Object.entries(listing);
	if (listing) return `<a href='${url}' target='_blank'>${title}</a>`;
};

const createDiv = (uniName, arrAnchors) => `
	<div class='container-org'>
		<h2>Results for ${uniName}:</h2>
		<ul>
			${arrAnchors.map((anchor) => `<li>${anchor}</li>`).join('')}
		</ul>
	</div>
`;

const navigateSite = async (params) => {
	const {
		page,
		canWaitForNavigation,
		errMessages,
		isAnchor,
		nextPageDisabledClass,
		nextPageLink,
		nextPageParentSelector,
	} = params;
	const previousUrl = page.url();
	const getNextPageElementParams = { page, errMessages, nextPageLink };
	const elNextPage = await getNextPageElement(getNextPageElementParams);
	const exitEarlyParams = {
		page,
		elNextPage,
		isAnchor,
		nextPageDisabledClass,
		nextPageParentSelector,
	};
	const navigateParams = {
		page,
		canWaitForNavigation,
		elNextPage,
		errMessages,
		previousUrl,
	};

	// Attempt to exit early
	const canExitEarly = await exitEarly(exitEarlyParams);
	if (canExitEarly) return;

	// Attempt to navigate
	const isSuccessfulNavigation = await runNavigationActions(navigateParams);

	// Base case
	if (isSuccessfulNavigation) return navigateSite(params);
};

const logSpecificError = (params) => {
	const { err, errMessages, functionName } = params;
	if (errMessages) {
		const arrErrMessages = errMessages.split(',');
		const isExpectedError = arrErrMessages.some(
			(expectedError) =>
				err.message.includes(expectedError) ||
				expectedError.includes(err.message)
		);

		if (isExpectedError) {
			console.log(
				`\nExpected error in function ${functionName}.\nAssuming last page reached.\n`
			);
			async function navigateSite(params) {
				const {
					page,
					canWaitForNavigation,
					errMessages,
					isAnchor,
					nextPageDisabledClass,
					nextPageLink,
					nextPageParentSelector,
				} = params;
				const previousUrl = page.url();
				const getNextPageElementParams = { page, errMessages, nextPageLink };
				const elNextPage = await getNextPageElement(getNextPageElementParams);
				const exitEarlyParams = {
					page,
					elNextPage,
					isAnchor,
					nextPageDisabledClass,
					nextPageParentSelector,
				};
				const navigateParams = {
					page,
					canWaitForNavigation,
					elNextPage,
					errMessages,
					previousUrl,
				};

				// Attempt to exit early
				const canExitEarly = await exitEarly(exitEarlyParams);
				if (canExitEarly) return;

				// Attempt to navigate
				const isSuccessfulNavigation = await runNavigationActions(
					navigateParams
				);

				// Base case
				if (isSuccessfulNavigation) return navigateSite(params);
			}

			const logSpecificError = (params) => {
				const { err, errMessages, functionName } = params;
				if (errMessages) {
					const arrErrMessages = errMessages.split(',');
					const isExpectedError = arrErrMessages.some(
						(expectedError) =>
							err.message.includes(expectedError) ||
							expectedError.includes(err.message)
					);

					if (isExpectedError) {
						console.log(
							`\nExpected error in function ${functionName}.\nAssuming last page reached.\n`
						);
					} else {
						console.error(
							`\nUnexpected error in function ${functionName}:\n\n`,
							err
						);
					}
				} else {
					console.log('\nNo provided expected errors.\n\nCarrying on...\n');
				}
			};

			const checkDisabledState = async (element, nextPageDisabledClass) => {
				return await element.evaluate((el, disabledClass) => {
					if (disabledClass) {
						const hasDisabledClass = el.classList.contains(disabledClass);
						const hasDisabledAttribute = el.hasAttribute('disabled');
						const isDisabled = hasDisabledClass || hasDisabledAttribute;

						return isDisabled;
					}
				}, nextPageDisabledClass);
			};

			const checkHrefState = async (elNextPage) => {
				return await elNextPage.evaluate(
					(el) => !el.hasAttribute('href') || !el.getAttribute('href').trim()
				);
			};

			const exitEarly = async (params) => {
				const {
					page,
					elNextPage,
					isAnchor,
					nextPageDisabledClass,
					nextPageParentSelector,
				} = params;

				// Null-check elNextPage
				const isElNextPageNull = !elNextPage;
				if (isElNextPageNull) return true;

				// Check if elNextPage cannot be clicked
				const isDisabled = nextPageParentSelector
					? await checkDisabledState(
							await page.waitForSelector(nextPageParentSelector, {
								timeout: 5000,
							}),
							nextPageDisabledClass
					  )
					: await checkDisabledState(elNextPage, nextPageDisabledClass);

				if (isDisabled) {
					console.log(
						'\nNext page element is disabled.\nAssuming last page reached.\n'
					);
					return true;
				}

				const hasNoHref = await checkHrefState(elNextPage);
				if (isAnchor && hasNoHref) {
					console.log(
						'\nNext page anchor has no href.\nAssuming last page reached.\n'
					);
					return true;
				}
			};

			const getNextPageElement = async (params) => {
				const { page, errMessages, nextPageLink } = params;
				try {
					return await page.waitForSelector(nextPageLink, { timeout: 5000 });
				} catch (err) {
					const functionName = 'getNextPageElement';
					const logSpecificErrorParams = { err, errMessages, functionName };
					logSpecificError(logSpecificErrorParams);
					return null;
				}
			};

			const clickAndWait = async (params) => {
				const { page, canWaitForNavigation, elNextPage } = params;
				const promises = [
					elNextPage.click(),
					canWaitForNavigation
						? page.waitForNavigation({ timeout: 10000 })
						: page.waitForNetworkIdle({ timeout: 10000 }),
				];
				await Promise.all(promises);
			};

			const waitForNewUrl = async (params) => {
				const { page, previousUrl } = params;
				const isNewUrl = async (previousUrl) => {
					await page.waitForFunction(
						(prevUrl) => window.location.href !== prevUrl,
						previousUrl
					);
				};
				await isNewUrl(previousUrl);
			};

			const runNavigationActions = async (params) => {
				const {
					page,
					canWaitForNavigation,
					elNextPage,
					errMessages,
					previousUrl,
				} = params;
				const clickAndWaitParams = { page, canWaitForNavigation, elNextPage };
				const waitForNewUrlParams = { page, previousUrl };

				try {
					await clickAndWait(clickAndWaitParams);
					await waitForNewUrl(waitForNewUrlParams);
					return true;
				} catch (err) {
					const functionName = 'runNavigationActions';
					const logSpecificErrorParams = { err, errMessages, functionName };
					logSpecificError(logSpecificErrorParams);
					return false;
				}
			};
		} else {
			console.error(`\nUnexpected error in function ${functionName}:\n\n`, err);
		}
	} else {
		console.log('\nNo provided expected errors.\n\nCarrying on...\n');
	}
};

const checkDisabledState = async (element, nextPageDisabledClass) => {
	return await element.evaluate((el, disabledClass) => {
		if (disabledClass) {
			const hasDisabledClass = el.classList.contains(disabledClass);
			const hasDisabledAttribute = el.hasAttribute('disabled');
			const isDisabled = hasDisabledClass || hasDisabledAttribute;

			return isDisabled;
		}
	}, nextPageDisabledClass);
};

const checkHrefState = async (elNextPage) => {
	return await elNextPage.evaluate(
		(el) => !el.hasAttribute('href') || !el.getAttribute('href').trim()
	);
};

const exitEarly = async (params) => {
	const {
		page,
		elNextPage,
		isAnchor,
		nextPageDisabledClass,
		nextPageParentSelector,
	} = params;

	// Null-check elNextPage
	const isElNextPageNull = !elNextPage;
	if (isElNextPageNull) return true;

	// Check if elNextPage cannot be clicked
	const isDisabled = nextPageParentSelector
		? await checkDisabledState(
				await page.waitForSelector(nextPageParentSelector, { timeout: 5000 }),
				nextPageDisabledClass
		  )
		: await checkDisabledState(elNextPage, nextPageDisabledClass);

	if (isDisabled) {
		console.log(
			'\nNext page element is disabled.\nAssuming last page reached.\n'
		);
		return true;
	}

	const hasNoHref = await checkHrefState(elNextPage);
	if (isAnchor && hasNoHref) {
		console.log(
			'\nNext page anchor has no href.\nAssuming last page reached.\n'
		);
		return true;
	}
};

const getNextPageElement = async (params) => {
	const { page, errMessages, nextPageLink } = params;
	try {
		return await page.waitForSelector(nextPageLink, { timeout: 5000 });
	} catch (err) {
		const functionName = 'getNextPageElement';
		const logSpecificErrorParams = { err, errMessages, functionName };
		logSpecificError(logSpecificErrorParams);
		return null;
	}
};

const clickAndWait = async (params) => {
	const { page, canWaitForNavigation, elNextPage } = params;
	const promises = [
		elNextPage.click(),
		canWaitForNavigation
			? page.waitForNavigation({ timeout: 10000 })
			: page.waitForNetworkIdle({ timeout: 10000 }),
	];
	await Promise.all(promises);
};

const waitForNewUrl = async (params) => {
	const { page, previousUrl } = params;
	const isNewUrl = async (previousUrl) => {
		await page.waitForFunction(
			(prevUrl) => window.location.href !== prevUrl,
			previousUrl
		);
	};
	await isNewUrl(previousUrl);
};

const runNavigationActions = async (params) => {
	const { page, canWaitForNavigation, elNextPage, errMessages, previousUrl } =
		params;
	const clickAndWaitParams = { page, canWaitForNavigation, elNextPage };
	const waitForNewUrlParams = { page, previousUrl };

	try {
		await clickAndWait(clickAndWaitParams);
		await waitForNewUrl(waitForNewUrlParams);
		return true;
	} catch (err) {
		const functionName = 'runNavigationActions';
		const logSpecificErrorParams = { err, errMessages, functionName };
		logSpecificError(logSpecificErrorParams);
		return false;
	}
};

const createDataObject = async (params) => {
	const { page, jobElement } = params;
	try {
		const objJobData = await page.evaluate(
			(el) => ({
				textContent: el.textContent,
				href: el.href,
			}),
			jobElement
		);
		return objJobData;
	} catch (err) {
		console.error('\nUnexpected error in function createDataObject:\n\n', err);
	}
};

const findMatch = (params) => {
	const { text, term } = params;
	const lowerCaseText = text.toLowerCase();
	const lowerCaseTerm = term.toLowerCase();
	const isMatch =
		lowerCaseText.includes(lowerCaseTerm) ||
		lowerCaseTerm.includes(lowerCaseText);
	return isMatch;
};

const formatJobText = (text) =>
	text
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase())
		.trim();

const alphabetizeScrapedJobs = (arr) => {
	const sortedArr = arr.sort((a, b) => {
		const [aKey] = Object.keys(a);
		const [bKey] = Object.keys(b);
		if (aKey < bKey) return -1;
		if (aKey > bKey) return 1;
		return 0;
	});
	return sortedArr;
};

const checkConsent = async (objCheckConsent) => {
	const { page, consentButton } = objCheckConsent;
	if (consentButton) {
		const promises = [
			page.click(consentButton),
			page.waitForSelector(consentButton, { timeout: 5000 }),
		];
		try {
			await Promise.all(promises);
		} catch (err) {
			console.error('Unexpected error in function checkConsent:\n\n', err);
		}
	}
};

const getJobs = async (getFilteredJobsParams) => {
	const { page, jobTitleLink, searchTerms } = getFilteredJobsParams;
	try {
		const jobElements = await page.$$(jobTitleLink);
		const filterJobsParams = { page, jobElements, searchTerms };
		const arrFilteredJobs = await filterJobs(filterJobsParams);
		return arrFilteredJobs;
	} catch (err) {
		console.error('\nUnexpected error in function getFilteredJobs:\n\n', err);
		return [];
	}
};

const filterJobs = async (params) => {
	const { page, jobElements, searchTerms } = params;
	try {
		const promise = jobElements.map(async (jobElement) => {
			const createDataObjectParams = { page, jobElement };
			const objJobData = await createDataObject(createDataObjectParams);
			const text = objJobData.textContent;
			const isMatch = searchTerms.some((term) => {
				const findMatchParams = { text, term };
				return findMatch(findMatchParams);
			});
			const title = formatJobText(text);
			const url = objJobData.href;
			if (isMatch) return { [title]: url };
		});
		const arrFilteredJobs = Promise.all(promise).then((res) =>
			res.filter((job) => job !== undefined)
		);
		return arrFilteredJobs;
	} catch (err) {
		console.error('\nUnexpected error in function filterJobs:\n\n', err);
	}
};

const insertJobListings = async (orgName, listings) => {
	const db = await connectToDB();
	const collection = db.collection('job_listings');
	try {
		const existingOrg = await collection.findOne({ org_name: orgName });

		if (existingOrg) {
			// Update existing organization
			await collection.updateOne(
				{ org_name: orgName },
				{ $push: { listings: { $each: listings } } } // Add new listings
			);
		} else {
			// Insert new organization with listings
			await collection.insertOne({ org_name: orgName, listings });
		}
		console.log('Job listings inserted.');
	} catch (err) {
		console.error('\nUnexpected error in function insertJobListings:\n\n', err);
	}
};

const processJobScraping = async (params) => {
	// Variables (destructured & normal)
	const { currentConfig, page, searchTerms } = params;
	const { url, uniName, ...configPairs } = currentConfig;
	const scrapeJobsParams = { page, searchTerms, configPairs };
	const arrDesiredJobs = [];
	try {
		// Go to the site
		await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

		// Scrape the listings
		const arrScrapedJobs = await scrapeJobs(scrapeJobsParams);

		// Guard clause (no jobs)
		if (!arrScrapedJobs.length) return null;

		// Push listings into an array
		arrScrapedJobs.forEach((objScrapedJob) => {
			// Separate the keys and values
			const arrCurrentUrl = Object.values(objScrapedJob);
			const [currentUrl] = arrCurrentUrl;

			// Check for duplicates
			const isNotIncluded = !arrDesiredJobs.some((obj) => {
				const arrPreviousUrl = Object.values(obj);
				const [previousUrl] = arrPreviousUrl;
				return previousUrl === currentUrl;
			});

			// Don't include duplicates
			if (isNotIncluded) arrDesiredJobs.push(objScrapedJob);
		});

		// Create the return object
		const objListings = { [uniName]: arrDesiredJobs };

		// Return the listings
		return objListings;
	} catch (err) {
		console.error(
			'\nUnexpected error in function processJobScraping:\n\n',
			err
		);
	}
};

export { createAnchor, createDiv, insertJobListings, processJobScraping };
