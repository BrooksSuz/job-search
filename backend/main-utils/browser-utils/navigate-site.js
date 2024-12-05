import handleError from './error.js';

async function navigateSite(
  page,
  canWait,
  errMessages,
  isAnchor,
  nextPageDisabled,
  nextPageLink,
  nextPageParent
) {
  const previousUrl = page.url();
  const elNextPage = await getNextPageElement(page, errMessages, nextPageLink);

  // Check if next page exists or is disabled
  const canStopRecursion = await stopRecursion(
    page,
    elNextPage,
    isAnchor,
    nextPageDisabled,
    nextPageParent
  );

  // Guard clause: Can stop recursion
  if (canStopRecursion) return false;

  // Navigate to the next page
  const isSuccessfulNavigation = await runNavigationActions(
    page,
    canWait,
    elNextPage,
    errMessages,
    previousUrl
  );

  // Recursive case: A successful navigation
  return isSuccessfulNavigation;
}

const getNextPageElement = async (page, errMessages, nextPageLink) =>
  await page.waitForSelector(nextPageLink, { timeout: 5000 }).catch((err) => {
    const functionName = 'getNextPageElement';
    handleError(err, errMessages, functionName);
    return null;
  });

const checkHrefState = async (elNextPage) =>
  await elNextPage.evaluate(
    (el) => !el.hasAttribute('href') || !el.getAttribute('href').trim()
  );

const checkDisabledState = async (element, nextPageDisabled) => {
  return await element.evaluate((el, disabledSelector) => {
    if (disabledSelector) {
      const hasDisabledSelector = el.classList.contains(disabledSelector);
      const hasDisabledAttribute = el.hasAttribute('disabled');
      const isDisabled = hasDisabledSelector || hasDisabledAttribute;

      return isDisabled;
    }
  }, nextPageDisabled);
};

const stopRecursion = async (
  page,
  elNextPage,
  isAnchor,
  nextPageDisabled,
  nextPageParent
) => {
  // Null-check elNextPage
  const isElNextPageNull = !elNextPage;
  if (isElNextPageNull) return true;

  // Check if elNextPage cannot be clicked
  const isDisabled = nextPageParent
    ? await checkDisabledState(
        // TODO: Catch this?
        await page.waitForSelector(nextPageParent, { timeout: 5000 }),
        nextPageDisabled
      )
    : await checkDisabledState(elNextPage, nextPageDisabled);

  if (isDisabled) {
    console.log(
      '\nNext page element is disabled.\nAssuming last page reached.\n'
    );
    return true;
  }

  const hasNoHref = await checkHrefState(elNextPage);
  if (isAnchor === 'true' && hasNoHref) {
    console.log(
      '\nNext page anchor has no href.\nAssuming last page reached.\n'
    );
    return true;
  }
};

const createClickAndWaitPromises = (page, canWait, elNextPage) => [
  elNextPage.click(),
  canWait === 'true'
    ? page.waitForNavigation({ timeout: 10000 })
    : page.waitForNetworkIdle({ timeout: 10000 }),
];

const clickAndWait = async (page, canWait, elNextPage) => {
  await Promise.all(createClickAndWaitPromises(page, canWait, elNextPage));
};

const waitForNewUrl = async (page, previousUrl) => {
  await page.waitForFunction(
    (previousUrl) => window.location.href !== previousUrl,
    previousUrl
  );
};

const runNavigationActions = async (
  page,
  canWait,
  elNextPage,
  errMessages,
  previousUrl
) => {
  try {
    await clickAndWait(page, canWait, elNextPage, errMessages);
    await waitForNewUrl(page, errMessages, previousUrl);
    return true;
  } catch (err) {
    const functionName = 'runNavigationActions';
    handleError(err, errMessages, functionName);
    return false;
  }
};

export default navigateSite;
