import configs from './job-search-configs.js';

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
	const spanBtnJobsText = document.querySelector('.get-jobs-text');
	const inputs = document.querySelectorAll('.advanced-inputs > label input');
	btnGetJobs.disabled = true;
	inputs.forEach((input) => {
		input.disabled = 'true';
	});
	spanBtnJobsText.style.display = 'none';
	const spanSpinner = document.querySelector('.spinner');
	const stopCount = updateCount();
	const stopSpinner = startSpinner(spanSpinner);

	func().finally(() => {
		spanSpinner.classList.remove('show');
		stopCount();
		stopSpinner();
		btnGetJobs.disabled = false;
		inputs.forEach((input) => {
			input.disabled = 'false';
		});
		spanBtnJobsText.style.display = 'inline';
	});
});

function startSpinner(spanSpinner) {
	const spinnerChars = ['|', '/', '-', '\\'];
	spanSpinner.classList.add('show');

	let i = 0;
	const spinnerInterval = setInterval(() => {
		spanSpinner.textContent = spinnerChars[i];
		i = (i + 1) % spinnerChars.length;
	}, 100);

	return () => clearInterval(spinnerInterval);
}

function updateCount() {
	const counterInterval = setInterval(() => {
		fetch('/api/count')
			.then((response) => response.json())
			.catch((error) => console.error('Error fetching count:', error));
	}, 500);

	return () => clearInterval(counterInterval);
}

async function func() {
	for (const config of configs) {
		// Get inputs
		const inputs = document.querySelectorAll('.advanced-inputs > label input');
		const inputKeywords = document.querySelector('.keywords');
		const inputKeywordsValue = encodeURIComponent(inputKeywords.value);

		// Assign them values
		const keys = Object.keys(config);
		keys.map((key, i) => {
			if (key === 'canWait' || key === 'isAnchor') {
				inputs[i].checked = config[key];
			} else {
				inputs[i].value = config[key];
			}
		});

		// Get the encoded keys/values
		const inputsEncoded = Array.from(inputs).map((input, i) => {
			const encodedKey = encodeURIComponent(keys[i]);
			const encodedValue =
				keys[i] === 'canWait' || keys[i] === 'isAnchor'
					? encodeURIComponent(input.checked)
					: encodeURIComponent(input.value);
			return `${encodedKey}=${encodedValue}`;
		});

		// Join them
		const params = inputsEncoded.join('&');

		// Run the current config
		await fetch(`/api/jobs?input=${inputKeywordsValue}&${params}`)
			.then((res) => res.json())
			.then((strHtml) => {
				const divJobList = document.querySelector('.job-list');
				divJobList.innerHTML += strHtml;
			})
			.catch((err) => {
				console.error('Error fetching job data:', err);
			});
	}
}
