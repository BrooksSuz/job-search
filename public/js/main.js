import {
	createConfigButtons,
	createDeleteAccountButton,
	createLogoutButton,
	executeJobSearch,
	logUserIn,
	registerUser,
} from './index.js';

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

// Persist user (if there's a current session)
document.addEventListener('DOMContentLoaded', handlePersistUser);

// Restore inputs
document.addEventListener('DOMContentLoaded', restoreInputs);

// Get premade configurations
document.addEventListener('DOMContentLoaded', handlePremadeLoad);

// Hold premade select element reference
const selectPremade = document.getElementById('premade-configs');

async function handleListingsClick() {
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

	try {
		// Get configs from database
		const arrConfigs = await fetchSelected();

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

		// Alphabetize and consume API endpoint
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
		console.error('Error in function handleListingsClick:', err);
	}
}

async function handleLogin(arrSites = []) {
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	let btnLogout = null;
	let btnDeleteAccount = null;
	try {
		// Log user in
		const response = await logUserIn();

		// Guard clause: No current user
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
		inputEmail.disabled = true;
		inputPassword.disabled = true;
	} catch (err) {
		console.error('Error in function handleLogin:', err);
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
	try {
		const response = await fetch('/api/user', {
			method: 'GET',
			credentials: 'include',
		});

		// Guard clause: Failed response
		if (!response.ok) return;

		const arrSites = await response.json().then((res) => res.sites);
		await handleLogin(arrSites);
	} catch (err) {
		console.debug('No session, or an error occurred:', err.message);
	}
}

function restoreInputs() {
	const inputKeywords = document.querySelector('.keywords');
	const inputsAdvanced = document.querySelectorAll(
		'.container-advanced > label input'
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

		// Populate the select element
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
	const newSelect = document.createElement('select');
	newSelect.id = 'user-configs';
	newSelect.name = 'user-configs';
	newSelect.multiple = true;

	// Populate select element with user-created configs
	arrSites.forEach((objConfig) => {
		const newOption = document.createElement('option');
		newOption.value = objConfig._id;
		newOption.textContent = objConfig.siteName;
		newSelect.appendChild(newOption);
	});

	// Replace premade with user select element
	selectElement.replaceWith(newSelect);
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

const fetchSelected = async () => {
	const strSelectIdSliced = getPrefix();
	const strCurrentId = `${strSelectIdSliced}-configs`;
	const selectElement = document.getElementById(strCurrentId);
	const arrConfigs = Array.from(selectElement.selectedOptions);
	const arrIds = arrConfigs.map((option) => option.value);
	try {
		const response = await fetch('/api/user-configs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ arrIds: arrIds }),
		});
		const arrSelected = await response.json();
		return arrSelected;
	} catch (err) {
		console.error('Error in function fetchSelected:', err);
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

		if (response.ok) console.log('HTML sent successfully');
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

export { btnLogin, btnRegister, selectPremade };
