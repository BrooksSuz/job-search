import executeJobSearch from './helpers/execute-job-search.js';
// import arrConfigs from './site-configs.js';

// Get premade configurations
document.addEventListener('DOMContentLoaded', onLoadGetPremade);

// Run main program logic
const btnGetListings = document.querySelector('.get-listings');
btnGetListings.addEventListener('click', onGetListingsClick);

// Log in
const btnLogin = document.querySelector('.login');
btnLogin.addEventListener('click', onLoginClick);

// Log out
const btnLogout = document.querySelector('.logout');
btnLogout.addEventListener('click', onLogoutClick);

// Register
const btnRegister = document.querySelector('.register');
btnRegister.addEventListener('click', onRegisterClick);

async function onLoadGetPremade() {
	const arrPremadeConfigs = await getPremadeConfigs();
	const selectPremade = document.getElementById('premade');
	arrPremadeConfigs.forEach((objConfig) => {
		const newOption = document.createElement('option');
		newOption.value = objConfig.siteName;
		newOption.textContent = objConfig.siteName;
		selectPremade.appendChild(newOption);
	});
}

async function onLoginClick() {
	const btnLogin = document.querySelector('.login');
	const btnLogout = document.querySelector('.logout');
	try {
		await handleAccountClick('login');
		await swapButtons(btnLogin, btnLogout);

		const inputEmail = document.querySelector('.email');
		const inputPassword = document.querySelector('.password');
		inputEmail.disabled = true;
		inputPassword.disabled = true;
	} catch (err) {
		console.error('Error in function onLoginClick', err);
	}
}

async function onLogoutClick() {
	const btnLogin = document.querySelector('.login');
	const btnLogout = document.querySelector('.logout');
	try {
		await handleLogOutClick();
		await swapButtons(btnLogout, btnLogin);
	} catch (err) {
		console.error('Error in function onLogoutClick', err);
	}

	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	inputEmail.disabled = false;
	inputEmail.value = '';
	inputPassword.disabled = false;
	inputPassword.value = '';
}

async function onRegisterClick() {
	handleAccountClick('register');
}

async function onGetListingsClick() {
	// Remove listings container from previous search
	const divMain = document.querySelector('.container-main');
	const divListings = document.querySelector('.listings');
	if (divListings) divMain.removeChild(divListings);

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

	// Get configs from database
	const arrConfigs = await fetchSiteConfigs();

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

		// Send mail
		// TODO: Figure out what to do with this (it works)
		// sendListingsHTML();
	});
}

const handleAccountClick = async (strRoute) => {
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	const email = inputEmail.value.trim();
	const password = inputPassword.value.trim();

	if (!email || !password) {
		console.error('Email and password cannot be empty.');
		return;
	}

	try {
		const response = await fetch(`/auth/${strRoute}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
			}),
		});

		if (!response.ok) {
			const responseText = await response.text();
			console.log(responseText);
		}
	} catch (err) {
		console.error(`Error in function handleAccountClick`, err);
	}
};

const swapButtons = async (btnNone, btnBlock) => {
	btnNone.style.display = 'none';
	btnBlock.style.display = 'block';
};

const handleLogOutClick = async () => {
	await fetch('/auth/logout');
};

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

const fetchSiteConfigs = async () => {
	try {
		const response = await fetch('/api/site-configs');
		const arrConfigs = await response.json();
		return arrConfigs;
	} catch (err) {
		console.error('Error fetching site configs:', err);
	}
};

const alphabetizeConfigs = (arrConfigs) =>
	[...arrConfigs].sort((a, b) =>
		a.siteName < b.siteName ? -1 : a.siteName > b.siteName ? 1 : 0
	);

const sendListingsHTML = async () => {
	const divListings = document.querySelector('.listings');
	const divToString = divListings.outerHTML;
	try {
		const response = await fetch(`/api/send-mail`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ html: divToString }),
		});

		if (response.ok) console.log('HTML sent successfully');
	} catch (err) {
		console.error('Error in function sendListingHTML', err);
	}
};

const getPremadeConfigs = async () => {
	try {
		const response = await fetch('/api/premade');
		if (!response.ok) throw new Error('Unauthorized');
		return await response.json();
	} catch (err) {
		console.error(err);
	}
};
