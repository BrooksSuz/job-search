async function getFilteredJobs(getFilteredJobsParams) {
	const { page, jobTitleLink, searchTerms } = getFilteredJobsParams;
	try {
		const jobElements = await page.$$(jobTitleLink);
		const filterJobsParams = { page, jobElements, searchTerms };
		const arrFilteredJobs = await filterJobs(filterJobsParams);

		return arrFilteredJobs;
	} catch (err) {
		console.error('\nError with function getFilteredJobs:\n\n', err);
		return [];
	}
}

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
		console.error('\nError with function createDataObject:\n\n', err);
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

			const key = formatJobText(text);
			const value = objJobData.href;
			if (isMatch) return { [key]: value };
		});

		const arrFilteredJobs = Promise.all(promise).then((res) =>
			res.filter((job) => job !== undefined)
		);

		return arrFilteredJobs;
	} catch (err) {
		console.error('\nError with function filterJobs:\n\n', err);
	}
};

export default getFilteredJobs;
