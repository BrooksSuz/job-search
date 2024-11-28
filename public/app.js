const btnGetJobs = document.querySelector('.get-jobs');
const h3Advanced = document.querySelector('.container-advanced > h3');

h3Advanced.addEventListener('click', () => {
	const divAdvancedInputsClassList =
		document.querySelector('.advanced-inputs').classList;
	const bool = divAdvancedInputsClassList.contains('show-flex');
	if (bool) {
		divAdvancedInputsClassList.remove('show-flex');
	} else {
		divAdvancedInputsClassList.add('show-flex');
	}
});

btnGetJobs.addEventListener('click', () => {
	const inputKeywords = document.querySelector('.keywords');
	const inputKeywordsValue = encodeURIComponent(inputKeywords.value);
	const divSpinner = document.querySelector('.spinner');
	const arrKeys = [
		'url',
		'uniName',
		'canWaitForNavigation',
		'consentButton',
		'errMessages',
		'isAnchor',
		'jobTitleLink',
		'nextPageDisabledClass',
		'nextPageLink',
		'nextPageParentSelector',
	];
	const advancedInputs = document.querySelectorAll(
		'.advanced-inputs > label > input'
	);
	const inputAdvancedValues = Array.from(advancedInputs).map(
		(inputAdvanced, index) => {
			const key = encodeURIComponent(arrKeys[index]);
			const value = encodeURIComponent(inputAdvanced.value);
			return `${key}=${value}`;
		}
	);
	const advancedParams = inputAdvancedValues.join('&');
	const stopSpinner = startSpinner(divSpinner);

	fetch(`/api/jobs?input=${inputKeywordsValue}&${advancedParams}`)
		.then((res) => res.json())
		.then((strHtml) => {
			const divJobList = document.querySelector('.job-list');
			divJobList.innerHTML += strHtml;
		})
		.catch((err) => {
			console.error('Error fetching job data:', err);
		})
		.finally(() => {
			divSpinner.classList.remove('show');
			stopSpinner();
		});
});

function startSpinner(divSpinner) {
	const spinnerChars = ['|', '/', '-', '\\'];
	divSpinner.classList.add('show');

	let i = 0;
	const spinnerInterval = setInterval(() => {
		divSpinner.textContent = spinnerChars[i];
		i = (i + 1) % spinnerChars.length;
	}, 100);

	return () => clearInterval(spinnerInterval);
}
