import { handleError } from './error.js';
import logger from '../logger-backend.js';

async function navigateSite(
  page,
  arrErrMessages,
  strIsAnchor,
  strNextPageDisabled,
  strNextPageLink,
  strNextPageParent
) {
  const urlPrevious = page.url();
  const elNextPage = await getNextPageElement(
    page,
    arrErrMessages,
    strNextPageLink
  );

  // Check if next page exists or is disabled
  const boolCanStopRecursion = await stopRecursion(
    page,
    elNextPage,
    strIsAnchor,
    strNextPageDisabled,
    strNextPageParent
  );

  // Guard clause: Can stop recursion
  if (boolCanStopRecursion) return false;

  // Check for successful navigation
  const boolIsSuccessfulNavigation = await runNavigationActions(
    page,
    elNextPage,
    arrErrMessages,
    urlPrevious
  );

  return boolIsSuccessfulNavigation;
}

const getNextPageElement = (page, arrErrMessages, strNextPageLink) =>
  page.waitForSelector(strNextPageLink).catch((err) => {
    handleError(err, arrErrMessages, 'getNextPageElement');
    return null;
  });

const checkHrefState = async (elNextPage) =>
  // Return booleans for readability
  await elNextPage.evaluate((el) => {
    if (!el.hasAttribute('href') || !el.getAttribute('href').trim()) {
      return true;
    }
    return false;
  });

const checkDisabledState = async (element, strNextPageDisabled) =>
  await element.evaluate((el, strNextPageDisabled) => {
    if (strNextPageDisabled) {
      // Check for a custom disabled style
      const boolHasDisabledSelector =
        el.classList.contains(strNextPageDisabled);

      // Check for the disabled attribute
      const boolHasDisabledAttribute = el.hasAttribute('disabled');

      return boolHasDisabledSelector || boolHasDisabledAttribute;
    }
  }, strNextPageDisabled);

const populateCheckDisabledState = async (
  page,
  elNextPage,
  strNextPageDisabled,
  strNextPageParent
) =>
  // Check if a parent selector string is provided and use it instead
  strNextPageParent
    ? await checkDisabledState(
        await page.waitForSelector(strNextPageParent),
        strNextPageDisabled
      )
    : await checkDisabledState(elNextPage, strNextPageDisabled);

const stopRecursion = async (
  page,
  elNextPage,
  strIsAnchor,
  strNextPageDisabled,
  strNextPageParent
) => {
  // Null-check elNextPage
  const boolIsElNextPageNull = !elNextPage;
  if (boolIsElNextPageNull) return true;

  // Stop if element is disabled
  const boolIsDisabled = await populateCheckDisabledState(
    page,
    elNextPage,
    strNextPageDisabled,
    strNextPageParent
  );

  if (boolIsDisabled) {
    logger.info(
      '\nNext page element is disabled.\nAssuming last page reached.'
    );
    return true;
  }

  // Stop if the element is an anchor and it has no href
  const boolHasNoHref = await checkHrefState(elNextPage);
  if (strIsAnchor === 'true' && boolHasNoHref) {
    logger.info('\nNext page anchor has no href.\nAssuming last page reached.');
    return true;
  }
};

const clickAndWait = async (page, elNextPage) => {
  await Promise.all([elNextPage.click(), page.waitForNetworkIdle()]);
};

const waitForNewUrl = async (page, urlPrevious) => {
  await page.waitForFunction(
    (urlPrevious) => window.location.href !== urlPrevious,
    urlPrevious
  );
};

const runNavigationActions = async (
  page,
  elNextPage,
  arrErrorMessages,
  urlPrevious
) => {
  try {
    await clickAndWait(page, elNextPage, arrErrorMessages);
    await waitForNewUrl(page, arrErrorMessages, urlPrevious);
    return true;
  } catch (err) {
    handleError(err, arrErrorMessages, 'runNavigationActions');
    return false;
  }
};

export default navigateSite;
