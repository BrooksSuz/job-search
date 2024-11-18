async function getFilteredJobs(page, jobTitleLink, searchTerms) {
  try {
    const jobElements = await page.$$(jobTitleLink);
    const filteredJobs = await filterJobs(page, jobElements, searchTerms);

    return filteredJobs;
  } catch (err) {
    console.log(`\nError with function getFilteredJobs:\n${err}`);
    return [];
  }
}

const createDataObject = async (page, jobElement) => {
  const jobData = await page.evaluate(
    (el) => ({
      textContent: el.textContent,
      href: el.href,
    }),
    jobElement
  );

  return jobData;
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
  const jobs = await Promise.all(
    jobElements.map(async (jobElement) => {
      const jobData = await createDataObject(page, jobElement);
      const isMatch = searchTerms.some((term) =>
        findMatch(jobData.textContent, term)
      );

      if (isMatch)
        return { [formatJobText(jobData.textContent)]: jobData.href };
    })
  );

  return jobs.filter((job) => job !== undefined);
};

export default getFilteredJobs;
