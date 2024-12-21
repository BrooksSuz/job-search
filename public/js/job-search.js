async function executeJobSearch(arrConfigs) {
	// Loop through each config
	for (const objConfig of arrConfigs) {
		const inputsAdvanced = document.querySelectorAll(
			'.advanced-container > label input'
		);

		// Encode user keywords
		const inputKeywords = document.querySelector('.keywords');
		const strKeywordsParam = encodeURIComponent(inputKeywords.value);
		const arrConfigKeys = Object.keys(objConfig);

		// Organize keys (safety measure)
		const arrOrganizedKeys = organizeKeys(inputsAdvanced, arrConfigKeys);

		// Fill search inputs
		populateInputs(inputsAdvanced, objConfig);

		// Encode input values for query string
		const strParams = encodeInputs(arrOrganizedKeys, inputsAdvanced).join('&');

		// Feed the config to the API
		await consumeAPI(strKeywordsParam, strParams);
	}
}

const organizeKeys = (inputsAdvanced, arrConfigKeys) => {
	const arrOrganizedKeys = [];
	inputsAdvanced.forEach((input) => {
		const id = input.id;
		const intIndexOfId = arrConfigKeys.indexOf(id);
		if (intIndexOfId !== -1) arrOrganizedKeys.push(arrConfigKeys[intIndexOfId]);
	});
	return arrOrganizedKeys;
};

const populateInputs = (inputsAdvanced, objConfig) => {
	inputsAdvanced.forEach((input) => {
		const id = input.id;
		if (id === 'isAnchor') {
			input.checked = objConfig[id];
		} else {
			input.value = objConfig[id];
		}
	});
};

const encodeInputs = (arrConfigKeys, inputsAdvanced) =>
	Array.from(inputsAdvanced).map((input, i) => {
		const encodedKey = encodeURIComponent(arrConfigKeys[i]);
		const encodedValue =
			arrConfigKeys[i] === 'isAnchor'
				? encodeURIComponent(input.checked)
				: encodeURIComponent(input.value);
		return `${encodedKey}=${encodedValue}`;
	});

const consumeAPI = async (inputKeywordsValue, strParams) => {
	try {
		// Fetch listings
		const response = await fetch(
			`/api/listings?keywords=${inputKeywordsValue}&${strParams}`
		);

		// Parse the response
		const strHtml = await response.json();
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(strHtml, 'text/html');

		// Create/get divListings; populate
		let divListings = document.querySelector('.listings');
		if (!divListings) {
			const divMain = document.querySelector('.main-container');
			divListings = document.createElement('div');
			divListings.classList.add('listings', 'flex');
			divMain.appendChild(divListings);
		}

		divListings.appendChild(htmlDoc.body.firstChild);
	} catch (err) {
		console.error('Error in function consumeAPI:', err);
	}
};

export default executeJobSearch;
