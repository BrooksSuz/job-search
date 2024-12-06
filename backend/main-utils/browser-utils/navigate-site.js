import handleError from './handle-error.js';

async function navigateSite(
  page,
  boolCanWait,
  arrErrMessages,
  boolIsAnchor,
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
    boolIsAnchor,
    strNextPageDisabled,
    strNextPageParent
  );

  // Guard clause: Can stop recursion
  if (boolCanStopRecursion) return false;

  // Navigate to the next page
  const boolIsSuccessfulNavigation = await runNavigationActions(
    page,
    boolCanWait,
    elNextPage,
    arrErrMessages,
    urlPrevious
  );

  // Recursive case: A successful navigation
  return boolIsSuccessfulNavigation;
}

const getNextPageElement = (page, arrErrMessages, strNextPageLink) =>
  page.waitForSelector(strNextPageLink, { timeout: 5000 }).catch((err) => {
    handleError(err, arrErrMessages, 'getNextPageElement');
    return null;
  });

const checkHrefState = async (elNextPage) =>
  await elNextPage.evaluate(
    (el) => !el.hasAttribute('href') || !el.getAttribute('href').trim()
  );

const checkDisabledState = async (element, strNextPageDisabled) =>
  await element.evaluate((el, strNextPageDisabled) => {
    if (strNextPageDisabled) {
      const boolHasDisabledSelector =
        el.classList.contains(strNextPageDisabled);
      const boolHasDisabledAttribute = el.hasAttribute('disabled');
      const boolIsDisabled =
        boolHasDisabledSelector || boolHasDisabledAttribute;

      return boolIsDisabled;
    }
  }, strNextPageDisabled);

const populateCheckDisabledState = async (
  page,
  elNextPage,
  strNextPageDisabled,
  strNextPageParent
) =>
  strNextPageParent
    ? await checkDisabledState(
        await page.waitForSelector(strNextPageParent, { timeout: 5000 }),
        strNextPageDisabled
      )
    : await checkDisabledState(elNextPage, strNextPageDisabled);

const stopRecursion = async (
  page,
  elNextPage,
  boolIsAnchor,
  strNextPageDisabled,
  strNextPageParent
) => {
  // Null-check elNextPage
  const boolIsElNextPageNull = !elNextPage;
  if (boolIsElNextPageNull) return true;

  // Check if elNextPage cannot be clicked
  const boolIsDisabled = await populateCheckDisabledState(
    page,
    elNextPage,
    strNextPageDisabled,
    strNextPageParent
  );

  if (boolIsDisabled) {
    console.log(
      'Next page element is disabled.\nAssuming last page reached.\n'
    );
    return true;
  }

  const hasNoHref = await checkHrefState(elNextPage);
  if (boolIsAnchor === 'true' && hasNoHref) {
    console.log('Next page anchor has no href.\nAssuming last page reached.\n');
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
