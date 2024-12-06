import throwErrorAndHalt from '../../error.js';

async function filterListings(page, arrSearchTerms, strListing) {
  try {
    // Get listing elements
    const arrElements = await page.$$(strListing);

    // Create a promise that searches for a provided term
    const findMatchPromises = createFindMatchPromises(
      page,
      arrElements,
      arrSearchTerms
    );

    // Execute each promise in parallel
    const filteredListings = await Promise.all(findMatchPromises).then(
      (arrListings) =>
        // Remove any undefined values from failed matches
        arrListings.filter((elListing) => elListing !== undefined)
    );

    return filteredListings;
  } catch (err) {
    throwErrorAndHalt;
  }
}

const createDataObject = (page, elListing) =>
  page
    .evaluate(
      (elListing) => ({
        textContent: elListing.textContent,
        href: elListing.href,
      }),
      elListing
    )
    .catch((err) => {
      throwErrorAndHalt;
    });

const toLowerCaseMultiple = (...args) => args.map((str) => str.toLowerCase());

const compareStrings = ([strTextContent, strSearchTerm]) =>
  strTextContent.includes(strSearchTerm) ||
  strSearchTerm.includes(strTextContent);

const findMatch = (strTextContent, strSearchTerm) =>
  compareStrings(toLowerCaseMultiple(strTextContent, strSearchTerm));

const formatJobText = (strTextContent) =>
  strTextContent
    .toLowerCase()
    // Lookbehind regex to prevent capitalization after apostrophes
    .replace(/(?<!')\b\w/g, (char) => char.toUpperCase())
    .trim();

const createFindMatchPromises = (page, arrElements, arrSearchTerms) =>
  arrElements.map(async (elListing) => {
    const objJobData = await createDataObject(page, elListing);
    const isMatch = arrSearchTerms.some((strTerm) =>
      findMatch(objJobData.textContent, strTerm)
    );
    if (isMatch)
      return { [formatJobText(objJobData.textContent)]: objJobData.href };
  });

export default filterListings;
