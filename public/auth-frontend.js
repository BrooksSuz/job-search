import { sliceId } from './helpers.js';

async function onLoginClick() {
	const btnLogin = document.querySelector('.login');
	const btnLogout = document.querySelector('.logout');
	try {
		const response = await logUserIn();
		const arrSites = await response.json().then((res) => res.user.sites);
		await changeSelectElement(arrSites);
		await swapButtons(btnLogin, btnLogout);

		const inputEmail = document.querySelector('.email');
		const inputPassword = document.querySelector('.password');
		inputEmail.disabled = true;
		inputPassword.disabled = true;
	} catch (err) {
		console.error('Error in function onLoginClick');
		throw err;
	}
}

async function onLogoutClick() {
	const btnLogin = document.querySelector('.login');
	const btnLogout = document.querySelector('.logout');
	try {
		await logUserOut();
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
	try {
		const boolSuccessful = await registerUser();
		if (boolSuccessful) {
			await onLoginClick();
		}
	} catch (err) {
		console.error('Error in function onRegisterClick', err);
		return;
	}
}

const swapButtons = async (btnNone, btnBlock) => {
	btnNone.style.display = 'none';
	btnBlock.style.display = 'block';
};

// Hold premade select element in memory
const selectPremade = document.getElementById('premade-configs');

const logUserOut = async () => {
	// Log the user out
	try {
		await fetch('/auth/logout');
	} catch (err) {
		console.error('Error in function handleLogOutClick', err);
		return;
	}

	// Reinsert premade select element
	const labelParent = document.querySelector('.container-configs > label');
	const selectUser = document.getElementById('user-configs');
	labelParent.removeChild(selectUser);
	labelParent.appendChild(selectPremade);
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

const logUserIn = async () => {
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	const email = inputEmail.value.trim();
	const password = inputPassword.value.trim();

	if (!email || !password) {
		alert('Email and password cannot be empty.');
		return;
	}

	try {
		const response = await fetch('/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password,
			}),
		});
		return response;
	} catch (err) {
		console.error('Error in function logUserIn');
		throw err;
	}
};

const registerUser = async () => {
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	const email = inputEmail.value.trim();
	const password = inputPassword.value.trim();

	if (!email || !password) {
		console.error('Email and password cannot be empty.');
		return;
	}

	try {
		const response = await fetch('/auth/register', {
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
			const data = await response.json();
			alert(data.message);
			return false;
		}

		alert('Registration successful. Happy hunting!');
		return true;
	} catch (err) {
		console.error('Error in function registerUser', err);
	}
};

const addConfig = () => {
	const inputsAdvanced = document.querySelectorAll(
		'.container-advanced > label input'
	);
	const arrInputsAdvanced = Array.from(inputsAdvanced, (input) => input);
	const arrAdvancedValues = arrInputsAdvanced.map((input) => {
		if ((input.type = 'checkbox')) return input.checked;
		return input.value;
	});
};

const createConfigButton = () => {
	const btnAdd = document.createElement('button');
	btnAdd.type = 'button';
	btnAdd.textContent = 'Add Config';
	btnAdd.addEventListener('click');
};

export { onLoginClick, onLogoutClick, onRegisterClick };
