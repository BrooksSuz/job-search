import { handleError } from "./error.js";
import logger from "../logger-backend.js";

async function navigateSite(
  page,
  arrErrMessages,
  boolIsAnchor,
  strNextPageDisabled,
  strNextPageLink,
  strNextPageParent,
) {
  const urlPrevious = page.url();
  const elNextPage = await getNextPageElement(
    page,
    arrErrMessages,
    strNextPageLink,
  );

  // Check if next page exists or is disabled
  const boolCanStopNavigation = await stopNavigation(
    page,
    elNextPage,
    boolIsAnchor,
    strNextPageDisabled,
    strNextPageParent,
  );

  // Guard clause: Can stop navigation
  if (boolCanStopNavigation) return false;

  // Check for successful navigation
  const boolIsSuccessfulNavigation = await runNavigationActions(
    page,
    elNextPage,
    arrErrMessages,
    urlPrevious,
  );

  return boolIsSuccessfulNavigation;
}

const getNextPageElement = (page, arrErrMessages, strNextPageLink) =>
  page.waitForSelector(strNextPageLink).catch((err) => {
    handleError(err, arrErrMessages, "getNextPageElement");
    return null;
  });

const checkHrefState = async (elNextPage) =>
  await elNextPage.evaluate((el) => {
    if (!el.hasAttribute("href") || !el.getAttribute("href").trim()) {
      return true;
    }
    return false;
  });

const checkDisabledState = async (element, strNextPageDisabled) => {
  return await element.evaluate((el, strNextPageDisabled) => {
    if (strNextPageDisabled) {
      const boolHasDisabledSelector =
        el.classList.contains(strNextPageDisabled);
      const boolHasDisabledAttribute = el.hasAttribute("disabled");
      return boolHasDisabledSelector || boolHasDisabledAttribute;
    }
  }, strNextPageDisabled);
};

const populateCheckDisabledState = async (
  page,
  elNextPage,
  strNextPageDisabled,
  strNextPageParent,
) =>
  strNextPageParent
    ? await checkDisabledState(
        await page.waitForSelector(strNextPageParent),
        strNextPageDisabled,
      )
    : await checkDisabledState(elNextPage, strNextPageDisabled);

const stopNavigation = async (
  page,
  elNextPage,
  boolIsAnchor,
  strNextPageDisabled,
  strNextPageParent,
) => {
  const boolIsElNextPageNull = !elNextPage;
  if (boolIsElNextPageNull) return true;

  const boolIsDisabled = await populateCheckDisabledState(
    page,
    elNextPage,
    strNextPageDisabled,
    strNextPageParent,
  );

  if (boolIsDisabled) {
    logger.info("\nNext page element is disabled. Assuming last page reached.");
    return true;
  }

  const boolHasNoHref = await checkHrefState(elNextPage);
  if (boolIsAnchor && boolHasNoHref) {
    logger.info("\nNext page anchor has no href. Assuming last page reached.");
    return true;
  }

  return false;
};

const clickAndWait = async (page, elNextPage) => {
  await Promise.all([elNextPage.click(), page.waitForNetworkIdle()]);
};

const waitForNewUrl = async (page, urlPrevious) => {
  await page.waitForFunction(
    (urlPrevious) => window.location.href !== urlPrevious,
    urlPrevious,
  );
};

const runNavigationActions = async (
  page,
  elNextPage,
  arrErrorMessages,
  urlPrevious,
) => {
  try {
    await clickAndWait(page, elNextPage, arrErrorMessages);
    await waitForNewUrl(page, urlPrevious);
    return true;
  } catch (err) {
    handleError(err, arrErrorMessages, "runNavigationActions");
    return false;
  }
};

export default navigateSite;
