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
	const selectPremade = document.getElementById('premade-configs');
	arrPremadeConfigs.forEach((objConfig) => {
		const newOption = document.createElement('option');
		newOption.value = objConfig._id;
		newOption.textContent = objConfig.siteName;
		selectPremade.appendChild(newOption);
	});
}

async function onLoginClick() {
	const btnLogin = document.querySelector('.login');
	const btnLogout = document.querySelector('.logout');
	try {
		const response = await handleAccountClick('login');
		const arrSites = await response.json().then((res) => res.user.sites);
		await changeSelectElement(arrSites);
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
	const arrConfigs = await useSelectedOptions();

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
}

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
		if (strRoute === 'login') return response;
	} catch (err) {
		console.error(`Error in function handleAccountClick`, err);
	}
};

const swapButtons = async (btnNone, btnBlock) => {
	btnNone.style.display = 'none';
	btnBlock.style.display = 'block';
};

// Hold premade select element in memory
const selectPremade = document.getElementById('premade-configs');

const handleLogOutClick = async () => {
	// Log the user out
	try {
		await fetch('/auth/logout');
	} catch (err) {
		console.error('Error logging user out', err);
		return;
	}

	// Reinsert premade select element
	const labelParent = document.querySelector('.container-configs > label');
	const selectUser = document.getElementById('user-configs');
	labelParent.removeChild(selectUser);
	labelParent.appendChild(selectPremade);
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

const sliceId = () => {
	const selectMenu = document.querySelector('[id$="configs"]');
	const strSelectMenuId = selectMenu.id;
	const intIdConfigsIndex = strSelectMenuId.indexOf('-');
	const strSelectIdSliced = strSelectMenuId.slice(0, intIdConfigsIndex);
	return strSelectIdSliced;
};

const changeSelectElement = async (arrSites) => {
	const strSelectIdSliced = sliceId();
	const strCurrentId = `${strSelectIdSliced}-configs`;
	const selectElement = document.getElementById(strCurrentId);
	const labelParent = document.querySelector('.container-configs > label');
	const newSelect = document.createElement('select');
	newSelect.id = 'user-configs';
	newSelect.name = 'user-configs';
	newSelect.multiple = true;
	arrSites.forEach((objConfig) => {
		const newOption = document.createElement('option');
		newOption.value = objConfig._id;
		newOption.textContent = objConfig.siteName;
		newSelect.appendChild(newOption);
	});
	labelParent.removeChild(selectElement);
	labelParent.appendChild(newSelect);
};

const useSelectedOptions = async () => {
	const strSelectIdSliced = sliceId();
	const strCurrentId = `${strSelectIdSliced}-configs`;
	const selectElement = document.getElementById(strCurrentId);
	const arrConfigs = Array.from(selectElement.selectedOptions);
	const arrIds = arrConfigs.map((option) => option.value);
	try {
		const response = await fetch('/api/configs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ arrIds: arrIds }),
		});
		const arrSelected = await response.json();
		return arrSelected;
	} catch (err) {
		console.error(err);
	}
};
