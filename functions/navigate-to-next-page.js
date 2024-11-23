async function navigateToNextPage(params) {
	const hasNextPage = await clickNavigationElement(params);
	if (hasNextPage) await navigateToNextPage(params);
}

const clickNavigationElement = async (params) => {
	const {
		page,
		canWaitForNavigation,
		errMessage,
		isAnchor,
		nextPageDisabledClass,
		nextPageLink,
	} = params;
	const previousUrl = page.url();
	const getNextPageElementParams = { page, errMessage, nextPageLink };
	const elNextPage = await getNextPageElement(getNextPageElementParams);

	if (!elNextPage) return false;
	if (isAnchor) {
		const isNextPageAnchorValidParams = {
			elNextPage,
			nextPageDisabledClass,
		};
		const isAnchorNotValid = !(await isNextPageAnchorValid(
			isNextPageAnchorValidParams
		));

		if (isAnchorNotValid) return false;
	}

	const clickAndNavigateParams = {
		page,
		elNextPage,
		canWaitForNavigation,
		errMessage,
		previousUrl,
	};

	return await clickAndNavigate(clickAndNavigateParams);
};

const isNextPageAnchorValid = async (params) => {
	const { elNextPage, nextPageDisabledClass } = params;

	const checkElementStateParams = { elNextPage, nextPageDisabledClass };
	const { isDisabled, noHref } = await checkElementState(
		checkElementStateParams
	);

	if (isDisabled || noHref) {
		console.log(
			'\nNext page anchor is disabled or has no href.\n\nAssuming last page reached.\n'
		);
		return false;
	}
	return true;
};

const getNextPageElement = async (params) => {
	const { page, errMessage, nextPageLink, timeout = 5000 } = params;

	try {
		return await page.waitForSelector(nextPageLink, { timeout });
	} catch (err) {
		const isExpectedError = errMessage.some(
			(e) => err.message.includes(e) || e.includes(err.message)
		);

		if (isExpectedError) {
			console.log(
				`\nExpected error in function getNextPageElement:\n\n${err.message}.\n\nAssuming last page reached.\n`
			);
		} else {
			console.error(
				'\nUnexpected error in function getNextPageElement:\n\n',
				err
			);
		}
		return null;
	}
};

const checkElementState = async (params) => {
	const { elNextPage, nextPageDisabledClass } = params;

	return await elNextPage.evaluate((el, disabledClass) => {
		if (!el) return { isDisabled: true, noHref: true };

		const hasDisabledClass = el.classList.contains(disabledClass);
		const hasDisabledAttribute = el.hasAttribute('disabled');
		const isDisabledProp = el.tagName.toLowerCase() !== 'a' && el.disabled;
		const noHref = !el.hasAttribute('href') || !el.getAttribute('href').trim();

		return {
			isDisabled: hasDisabledClass || hasDisabledAttribute || isDisabledProp,
			noHref,
		};
	}, nextPageDisabledClass);
};

const clickAndNavigate = async (params) => {
	const {
		page,
		elNextPage,
		canWaitForNavigation,
		errMessage,
		previousUrl,
		timeout = 10000,
	} = params;

	try {
		const promises = [
			elNextPage.click(),
			canWaitForNavigation
				? page.waitForNavigation({ timeout })
				: page.waitForNetworkIdle({ timeout }),
		];

		const isNewUrl = async (previousUrl) => {
			await page.waitForFunction(
				(prevUrl) => window.location.href !== prevUrl,
				previousUrl
			);
		};

		await Promise.all(promises);
		await isNewUrl(previousUrl);
		return true;
	} catch (err) {
		const isExpectedError = errMessage.some(
			(e) => err.message.includes(e) || e.includes(err.message)
		);
		if (isExpectedError) {
			console.log(
				`\nExpected error in function clickAndNavigate:\n\n${err.message}.\n\nAssuming last page reached.\n`
			);
		} else {
			console.error(
				`\nUnexpected error in function clickAndNavigate:\n\n${err}`
			);
		}
		return false;
	}
};

export default navigateToNextPage;
