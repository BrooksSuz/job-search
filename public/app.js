import arrConfigs from './site-configs.js';

// Run main program logic
document
	.querySelector('.get-listings')
	.addEventListener('click', onBtnGetListingsClick);

async function onBtnGetListingsClick() {
	// Remove children from previous search
	const divListings = document.querySelector('.listings');
	if (divListings.firstChild) divListings.replaceChildren();

	// Disable search elements
	const btnGetListings = document.querySelector('.get-listings');
	const inputsAdvanced = document.querySelectorAll(
		'.container-advanced > label input'
	);
	btnGetListings.disabled = true;
	inputsAdvanced.forEach((input) => {
		input.disabled = true;
	});

	// Replace button text with spinner animation
	const spanBtnListingsText = document.querySelector('.get-listings-text');
	spanBtnListingsText.style.display = 'none';
	const spanSpinner = document.querySelector('.spinner');
	const stopSpinner = startSpinner(spanSpinner);

	// Alphabetize and consume API endpoint
	const arrAlphabetizedConfigs = alphabetizeConfigs(arrConfigs);
	await executeJobSearch(arrAlphabetizedConfigs).finally(() => {
		// Remove/stop the spinner and display original text
		spanSpinner.classList.remove('show');
		stopSpinner();
		spanBtnListingsText.style.display = 'inline';

		// Re-enable search elements
		btnGetListings.disabled = false;
		inputsAdvanced.forEach((input) => {
			input.disabled = false;
		});
	});
}

async function executeJobSearch(arrAlphabetizedConfigs) {
	// Loop through each config
	for (const objConfig of arrAlphabetizedConfigs) {
		const inputsAdvanced = document.querySelectorAll(
			'.container-advanced > label input'
		);

		// Encode user keywords
		const inputKeywords = document.querySelector('.keywords');
		const strKeywordsParam = encodeURIComponent(inputKeywords.value);
		const arrConfigKeys = Object.keys(objConfig);

		// Fill search inputs
		populateElements(arrConfigKeys, inputsAdvanced, objConfig);

		// Encode input values for query string
		const strParams = encodeInputs(arrConfigKeys, inputsAdvanced).join('&');

		// Feed the config to the API
		await consumeAPI(strKeywordsParam, strParams);
	}
}

const startSpinner = (spanSpinner) => {
	const spinnerChars = ['|', '/', '-', '\\'];
	spanSpinner.classList.add('show');

	let i = 0;
	const spinnerInterval = setInterval(() => {
		spanSpinner.textContent = spinnerChars[i];
		i = (i + 1) % spinnerChars.length;
	}, 90);

	return () => clearInterval(spinnerInterval);
};

const alphabetizeConfigs = (arrConfigs) =>
	[...arrConfigs].sort((a, b) =>
		a.siteName < b.siteName ? -1 : a.siteName > b.siteName ? 1 : 0
	);

const populateElements = (arrConfigKeys, inputsAdvanced, objConfig) => {
	arrConfigKeys.map((key, i) => {
		if (key === 'canWait' || key === 'isAnchor') {
			inputsAdvanced[i].checked = objConfig[key];
		} else {
			inputsAdvanced[i].value = objConfig[key];
		}
	});
};

const encodeInputs = (arrConfigKeys, inputsAdvanced) =>
	Array.from(inputsAdvanced).map((input, i) => {
		const encodedKey = encodeURIComponent(arrConfigKeys[i]);
		const encodedValue =
			arrConfigKeys[i] === 'canWait' || arrConfigKeys[i] === 'isAnchor'
				? encodeURIComponent(input.checked)
				: encodeURIComponent(input.value);
		return `${encodedKey}=${encodedValue}`;
	});

const consumeAPI = async (inputKeywordsValue, strParams) => {
	try {
		const response = await fetch(
			`/api/listings?keywords=${inputKeywordsValue}&${strParams}`
		);
		const strHtml = await response.json();
		const divListings = document.querySelector('.listings');
		divListings.innerHTML += strHtml;
	} catch (err) {
		console.error('Error fetching listing data:', err);
	}
};
