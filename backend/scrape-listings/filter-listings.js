import { throwErrorAndHalt } from "./error.js";

async function filterListings(page, arrSearchTerms, strListing) {
  try {
    // Get listing elements
    const arrElements = await page.$$(strListing);

    // Create promises for searching provided terms
    const findMatchPromises = createFindMatchPromises(
      page,
      arrElements,
      arrSearchTerms,
    );

    // Wait for all promises to resolve
    const arrListings = await Promise.all(findMatchPromises);

    // Remove any undefined values
    const filteredListings = arrListings.filter(
      (elListing) => elListing !== undefined,
    );

    return filteredListings;
  } catch (err) {
    throwErrorAndHalt(err, "filterListings");
  }
}

const createDataObject = (page, elListing) =>
  page
    .evaluate(
      (elListing) => ({
        textContent: elListing.textContent,
        href: elListing.href,
      }),
      elListing,
    )
    .catch((err) => {
      throwErrorAndHalt(err, "createDataObject");
    });

const toLowerCaseMultiple = (...args) => args.map((str) => str.toLowerCase());

const compareStrings = ([strTextContent, strSearchTerm]) =>
  strTextContent.includes(strSearchTerm) ||
  strSearchTerm.includes(strTextContent);

const findMatch = (strTextContent, strSearchTerm) =>
  compareStrings(toLowerCaseMultiple(strTextContent, strSearchTerm));

const formatListingText = (strTextContent) =>
  strTextContent
    .toLowerCase()
    // Lookbehind regex to prevent capitalization after apostrophes
    .replace(/(?<!')\b\w/g, (char) => char.toUpperCase())
    .trim();

const createFindMatchPromises = (page, arrElements, arrSearchTerms) =>
  arrElements.map(async (elListing) => {
    const objListingData = await createDataObject(page, elListing);
    const isMatch = arrSearchTerms.some((strTerm) =>
      findMatch(objListingData.textContent, strTerm),
    );
    if (isMatch)
      return {
        [formatListingText(objListingData.textContent)]: objListingData.href,
      };
  });

export default filterListings;
