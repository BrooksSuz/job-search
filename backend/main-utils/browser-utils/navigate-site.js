async function navigateSite(params) {
  const {
    page,
    canWait,
    errMessages,
    isAnchor,
    nextPageDisabled,
    nextPageLink,
    nextPageParent,
  } = params;

  const previousUrl = page.url();
  const elNextPage = await getNextPageElement({
    page,
    errMessages,
    nextPageLink,
  });

  // Check if next page exists or is disabled
  const canExitEarly = await exitEarly({
    page,
    elNextPage,
    isAnchor,
    nextPageDisabled,
    nextPageParent,
  });
  if (canExitEarly) return false;

  // Navigate to the next page
  const isSuccessfulNavigation = await runNavigationActions({
    page,
    canWait,
    elNextPage,
    errMessages,
    previousUrl,
  });

  return isSuccessfulNavigation;
}

const handleError = (params) => {
  const { err, errMessages, functionName } = params;
  if (errMessages) {
    const arrErrMessages = errMessages.split(',');
    const isExpectedError = arrErrMessages.some(
      (expectedError) =>
        err.message.includes(expectedError) ||
        expectedError.includes(err.message)
    );

    if (isExpectedError) {
      console.log(
        `\nExpected error in function ${functionName}.\nAssuming last page reached.\n`
      );
    } else {
      console.error(`\nUnexpected error in function ${functionName}:\n\n`, err);
    }
  } else {
    console.log('\nNo provided expected errors.\n\nCarrying on...\n');
  }
};

const getNextPageElement = async (params) => {
  const { page, errMessages, nextPageLink } = params;
  try {
    return await page.waitForSelector(nextPageLink, { timeout: 5000 });
  } catch (err) {
    const functionName = 'getNextPageElement';
    const handleErrorParams = { err, errMessages, functionName };
    handleError(handleErrorParams);
    return null;
  }
};

const exitEarly = async (params) => {
  const { page, elNextPage, isAnchor, nextPageDisabled, nextPageParent } =
    params;

  // Null-check elNextPage
  const isElNextPageNull = !elNextPage;
  if (isElNextPageNull) return true;

  // Check if elNextPage cannot be clicked
  const isDisabled = nextPageParent
    ? await checkDisabledState(
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

const checkHrefState = async (elNextPage) => {
  return await elNextPage.evaluate(
    (el) => !el.hasAttribute('href') || !el.getAttribute('href').trim()
  );
};

const runNavigationActions = async (params) => {
  const { page, canWait, elNextPage, errMessages, previousUrl } = params;
  const clickAndWaitParams = { page, canWait, elNextPage };
  const waitForNewUrlParams = { page, previousUrl };

  try {
    await clickAndWait(clickAndWaitParams);
    await waitForNewUrl(waitForNewUrlParams);
    return true;
  } catch (err) {
    const functionName = 'runNavigationActions';
    const handleErrorParams = { err, errMessages, functionName };
    handleError(handleErrorParams);
    return false;
  }
};

const clickAndWait = async (params) => {
  const { page, canWait, elNextPage } = params;
  const promises = [
    elNextPage.click(),
    canWait === 'true'
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

export default navigateSite;
