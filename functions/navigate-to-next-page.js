async function navigateToNextPage(params) {
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
  if (isSuccessfulNavigation) return navigateToNextPage(params);
}

const logSpecificError = (params) => {
  const { err, errMessages, functionName } = params;
  if (errMessages) {
    const isExpectedError = errMessages.some(
      (expectedError) =>
        err.message.includes(expectedError) ||
        expectedError.includes(err.message)
    );

    if (isExpectedError) {
      console.log(
        `\nExpected error in function ${functionName}.\nAssuming last page reached.\n`
      );
    } else {
      console.error('\nUnexpected error in function ${functionName}:\n\n', err);
    }
  } else {
    console.log('\nNo provided expected errors.\n\nCarrying on...\n');
  }
};

const checkDisabledState = async (element, nextPageDisabledClass) => {
  return await element.evaluate((el, disabledClass) => {
    const hasDisabledClass = el.classList.contains(disabledClass);
    const hasDisabledAttribute = el.hasAttribute('disabled');
    const isDisabled = hasDisabledClass || hasDisabledAttribute;

    return isDisabled;
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

export default navigateToNextPage;
