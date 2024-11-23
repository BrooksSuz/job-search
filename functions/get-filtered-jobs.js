async function getFilteredJobs(objFilteredJobs) {
	const { page, jobTitleLink, searchTerms } = objFilteredJobs;

	try {
		const jobElements = await page.$$(jobTitleLink);
		const arrFilteredJobs = await filterJobs(page, jobElements, searchTerms);
		return arrFilteredJobs;
	} catch (err) {
		console.error('\nError with function getFilteredJobs:\n', err);
		return [];
	}
}

const createDataObject = async (page, jobElement) => {
	try {
		const jobData = await page.evaluate(
			(el) => ({
				textContent: el.textContent,
				href: el.href,
			}),
			jobElement
		);

		return jobData;
	} catch (err) {
		console.error('\nError with function createDataObject:\n', err);
	}
};

const findMatch = (text, term) => {
	const lowerCaseText = text.toLowerCase();
	const lowerCaseTerm = term.toLowerCase();
	const isMatch =
		lowerCaseText.includes(lowerCaseTerm) ||
		lowerCaseTerm.includes(lowerCaseText);

	return isMatch;
};

const formatJobText = (text) => {
	return text
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase())
		.trim();
};

const filterJobs = async (page, jobElements, searchTerms) => {
	try {
		const promise = jobElements.map(async (jobElement) => {
			const jobData = await createDataObject(page, jobElement);
			const isMatch = searchTerms.some((term) =>
				findMatch(jobData.textContent, term)
			);

			if (isMatch)
				return { [formatJobText(jobData.textContent)]: jobData.href };
		});

		const jobs = await Promise.all(promise);
		return jobs.filter((job) => job !== undefined);
	} catch (err) {
		console.error('\nError with function filterJobs:\n', err);
	}
};

export default getFilteredJobs;
