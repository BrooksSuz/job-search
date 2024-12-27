import {
	getUserCredentials,
	logUserIn,
	registerUser,
} from './js/auth-frontend.js';
import {
	changeButtonState,
	createConfigButtons,
	createDeleteAccountButton,
	createLogoutButton,
} from './js/dom-manipulation.js';
import executeJobSearch from './js/job-search.js';
import logMessage from './js/logger-frontend.js';

// Run main program logic
const btnGetListings = document.querySelector('.get-listings');
btnGetListings.addEventListener('click', handleListingsClick);

// Log in
const btnLogin = document.querySelector('.btn-login');
btnLogin.addEventListener('click', handleLogin);

// Register
const btnRegister = document.querySelector('.btn-register');
btnRegister.addEventListener('click', handleRegister);

// Persist text input values
const textInputs = document.querySelector('input[type="text"]');
textInputs.addEventListener('input', (e) => {
	handlePersistTextInputs(e);
});

// Restore inputs
document.addEventListener('DOMContentLoaded', handleRestoreInputs);

// Get premade configurations
document.addEventListener('DOMContentLoaded', handlePremadeLoad);

// Persist user (if there's a current session)
document.addEventListener('DOMContentLoaded', handlePersistUser);

// Hold premade select element reference
const selectPremade = document.getElementById('premade-configs');
selectPremade.addEventListener('click', () => {
	const btnGetJobs = document.querySelector('.get-listings');
	changeButtonState(btnGetJobs, selectPremade);
});

async function handleListingsClick() {
	// Remove listings container from previous search
	const divMain = document.querySelector('.main-container');
	const divListings = document.querySelector('.listings');
	if (divListings) divMain.removeChild(divListings);

	// Disable search elements
	const btnGetListings = document.querySelector('.get-listings');
	const inputsAdvanced = document.querySelectorAll(
		'.advanced-container > label input'
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

	try {
		// Get configs from database
		const arrConfigs = await fetchUserCreated();

		// Guard clause: No provided configs
		if (!arrConfigs.length) {
			cleanUpDOM(
				spanSpinner,
				stopSpinner,
				spanBtnListingsText,
				btnGetListings,
				inputsAdvanced
			);
			return;
		}

		// Alphabetize and run job search
		const arrAlphabetizedConfigs = alphabetizeConfigs(arrConfigs);
		await executeJobSearch(arrAlphabetizedConfigs).finally(() => {
			cleanUpDOM(
				spanSpinner,
				stopSpinner,
				spanBtnListingsText,
				btnGetListings,
				inputsAdvanced
			);

			// Send mail
			// TODO: Figure out what to do with this (it works)
			// sendListingsHTML();
		});
	} catch (err) {
		log.error('Error in function handleListings', err);
	}
}

const dealWithLogIn = async (email, password, arrSites = []) => {
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	const divAdvancedContainer = document.querySelector('.advanced-container');
	const btnLogin = document.querySelector('.btn-login');
	const btnRegister = document.querySelector('.btn-register');
	let btnLogout = null;
	let btnDeleteAccount = null;

	// Log user in
	const response = await logUserIn(email, password);

	// Fill arrSites
	if (!arrSites.length)
		arrSites = await response.json().then((res) => res.user.sites);

	// Create/get logout button
	if (!btnLogout) {
		btnLogout = createLogoutButton();
	} else {
		btnLogout = document.querySelector('.btn-logout');
	}

	// Create/get delete button
	if (!btnDeleteAccount) {
		btnDeleteAccount = createDeleteAccountButton();
	} else {
		btnLogout = document.querySelector('.btn-delete-account');
	}

	// Update the DOM
	btnLogin.replaceWith(btnLogout);
	btnRegister.replaceWith(btnDeleteAccount);
	changeSelectElement(arrSites);
	createConfigButtons();
	divAdvancedContainer.style.display = 'block';
	inputEmail.disabled = true;
	inputPassword.disabled = true;
};

async function handleLogin() {
	try {
		const user = await fetch('/api/user', {
			method: 'GET',
			credentials: 'include',
		}).then((res) => res.json());

		if (!user) {
			const { email, password } = getUserCredentials();

			// Guard clause: Email/password inputs are empty
			if (!email || !password) {
				Swal.fire('Email and password cannot be empty.');
				return;
			}

			await dealWithLogIn(email, password);
			return;
		}

		await dealWithLogIn(user.email, user.password);
	} catch (err) {
		await logMessage('error', err.message);
	}
}

async function handleRegister() {
	try {
		const boolSuccessful = await registerUser();
		if (boolSuccessful) {
			await handleLogin();
		}
	} catch (err) {
		console.error('Error in function handleRegister:', err);
	}
}

function handlePersistTextInputs(e) {
	const input = e.target;
	if (input.matches('label input')) {
		const id = input.id;
		const properCase = id.charAt(0).toUpperCase() + id.slice(1);
		setLocalItem(`user${properCase}`, input.value);
	}
}

async function handlePersistUser() {
	const divAdvancedContainer = document.querySelector('.advanced-container');
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	let btnLogout = null;
	let btnDeleteAccount = null;
	try {
		const user = await fetch('/api/user', {
			method: 'GET',
			credentials: 'include',
		}).then((res) => res.json());

		// Guard clause: Failed response
		if (!user) return;

		const arrIds = user.sites;
		console.log(arrIds);
		const arrSites = await fetch('/api/user-configs', {
			method: 'POST',
			body: JSON.stringify({ arrIds: arrIds }),
		}).then((res) => res.json());

		// Create/get logout button
		if (!btnLogout) {
			btnLogout = createLogoutButton();
		} else {
			btnLogout = document.querySelector('.btn-logout');
		}

		// Create/get delete button
		if (!btnDeleteAccount) {
			btnDeleteAccount = createDeleteAccountButton();
		} else {
			btnLogout = document.querySelector('.btn-delete-account');
		}

		// Update the DOM
		btnLogin.replaceWith(btnLogout);
		btnRegister.replaceWith(btnDeleteAccount);
		changeSelectElement(arrSites);
		createConfigButtons();
		divAdvancedContainer.style.display = 'block';
		inputEmail.disabled = true;
		inputPassword.disabled = true;
	} catch (err) {
		console.error('Error in function handlePersistUser', err);
	}
}

function handleRestoreInputs() {
	const inputKeywords = document.querySelector('.keywords');
	const inputsAdvanced = document.querySelectorAll(
		'.advanced-container > label input'
	);

	// Restore user keywords input
	const strUserKeywords = JSON.parse(localStorage.getItem('userKeywords'));
	if (strUserKeywords) inputKeywords.value = strUserKeywords;

	// Restore user advanced inputs
	inputsAdvanced.forEach((input) => {
		const strUserAdvanced = JSON.parse(localStorage.getItem(`user${input.id}`));
		if (strUserAdvanced) input.value = strUserAdvanced;
	});
}

async function handlePremadeLoad() {
	try {
		// Fetch premade configs
		const arrPremadeConfigs = await fetchPremade();

		// Fill the select element
		for (const objConfig of arrPremadeConfigs) {
			const newOption = document.createElement('option');
			newOption.value = objConfig._id;
			newOption.textContent = objConfig.siteName;
			selectPremade.appendChild(newOption);
		}
	} catch (err) {
		console.error('Error in function handlePremadeLoad:', err);
	}
}

const alphabetizeConfigs = (arrConfigs) =>
	arrConfigs
		.slice()
		.sort((a, b) =>
			a.siteName < b.siteName ? -1 : a.siteName > b.siteName ? 1 : 0
		);

const getPrefix = () => {
	const selectMenu = document.querySelector('[id$="configs"]');
	const strSelectMenuId = selectMenu.id;
	const intIdConfigsIndex = strSelectMenuId.indexOf('-');
	const strSelectIdSliced = strSelectMenuId.slice(0, intIdConfigsIndex);
	return strSelectIdSliced;
};

const changeSelectElement = (arrSites) => {
	// Get the correct prefix
	const strPrefix = getPrefix();
	const strCurrentId = `${strPrefix}-configs`;

	// Get/create select elements
	const selectElement = document.getElementById(strCurrentId);
	const selectUser = document.createElement('select');
	selectUser.id = 'user-configs';
	selectUser.name = 'user-configs';
	selectUser.multiple = true;

	const btnGetJobs = document.querySelector('.get-listings');
	selectUser.addEventListener('click', () => {
		changeButtonState(btnGetJobs, selectUser);
	});

	// Populate select element with user-created configs
	arrSites.forEach((objConfig) => {
		const newOption = document.createElement('option');
		newOption.value = objConfig._id;
		newOption.textContent = objConfig.siteName;
		selectUser.appendChild(newOption);
	});

	// Replace premade with user select element
	selectElement.replaceWith(selectUser);
	changeButtonState(btnGetJobs, selectUser);
};

const cleanUpDOM = (
	spanSpinner,
	stopSpinner,
	spanBtnListingsText,
	btnGetListings,
	inputsAdvanced
) => {
	// Remove/stop the spinner and display original text
	spanSpinner.classList.remove('show');
	stopSpinner();
	spanBtnListingsText.style.display = 'inline';

	// Re-enable search elements
	btnGetListings.disabled = false;
	inputsAdvanced.forEach((input) => {
		input.disabled = false;
	});
};

const fetchPremade = async () => {
	try {
		const response = await fetch('/api/premade-configs');
		if (!response.ok) return;
		const arrPremade = await response.json();
		return arrPremade;
	} catch (err) {
		console.error('Error in function fetchPremade:', err);
	}
};

const fetchUserCreated = async () => {
	const strSelectIdSliced = getPrefix();
	const strCurrentId = `${strSelectIdSliced}-configs`;
	const selectElement = document.getElementById(strCurrentId);
	const arrConfigs = Array.from(selectElement.selectedOptions);
	console.log(arrConfigs);
	const arrIds = arrConfigs.map((option) => option.value);
	try {
		const response = await fetch('/api/user-configs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ arrIds: arrIds }),
		});
		const arrUserCreated = await response.json();
		return arrUserCreated;
	} catch (err) {
		console.error('Error in function fetchUserCreated:', err);
	}
};

const sendListingsHTML = async () => {
	const divListings = document.querySelector('.listings');
	const divToString = divListings.outerHTML;
	try {
		const response = await fetch(`/api/listings-mail`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ html: divToString }),
		});
	} catch (err) {
		console.error('Error in function sendListingsHTML:', err);
	}
};

const setLocalItem = (strKey, strValue) => {
	localStorage.setItem(strKey, JSON.stringify(strValue));
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

export { btnLogin, btnRegister };
