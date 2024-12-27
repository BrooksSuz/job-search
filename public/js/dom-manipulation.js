import { btnLogin, btnRegister } from '../main.js';
import {
	addConfig,
	deleteUser,
	logUserOut,
	removeConfig,
} from './auth-frontend.js';

// Store selectPremade reference
const selectPremade = document.querySelector('#premade-configs');

function createLogoutButton() {
	return buttonFactory('btn-logout', 'Logout', handleLogout);
}

function createDeleteAccountButton() {
	return buttonFactory(
		'btn-delete-account',
		'Delete Account',
		handleAccountDeletion
	);
}

function cleanUpAccountDeletion() {
	// Get EVERYTHING
	const inputOldEmail = document.querySelector('.email');
	const inputOldPassword = document.querySelector('.password');
	const btnLogout = document.querySelector('.btn-logout');
	const btnDeleteAccount = document.querySelector('.btn-delete-account');
	const selectUser = document.getElementById('user-configs');
	const divAdvancedContainer = document.querySelector('.advanced-container');

	// Create new user account inputs
	const inputEmail = document.createElement('input');
	const inputPassword = document.createElement('input');
	inputEmail.type = 'email';
	inputPassword.type = 'password';
	inputEmail.classList.add('email');
	inputPassword.classList.add('password');

	// Replace user account inputs
	inputOldEmail.replaceWith(inputEmail);
	inputOldPassword.replaceWith(inputPassword);

	// Replace logout with login button
	btnLogout.replaceWith(btnLogin);

	// Replace delete account with register button
	btnDeleteAccount.replaceWith(btnRegister);

	// Remove add/remove config buttons
	const btnAdd = document.querySelector('.btn-add');
	btnAdd.parentNode.removeChild(btnAdd);
	const btnRemove = document.querySelector('.btn-remove');
	btnRemove.parentNode.removeChild(btnRemove);

	// Replace user with premade select element
	const btnGetJobs = document.querySelector('.get-listings');
	selectUser.replaceWith(selectPremade);
	const areSelectedOptions = selectPremade.selectedOptions.length;
	if (areSelectedOptions) selectPremade.selectedIndex = -1;
	changeButtonState(btnGetJobs, selectPremade);

	// Set advanced display to none
	divAdvancedContainer.style.display = 'none';
}

function createConfigButtons() {
	const divContainer = document.createElement('div');
	const divAdvanced = document.querySelector('.advanced-container');
	const btnAdd = createAddButton();
	const btnRemove = createRemoveButton();
	divContainer.classList.add('button-container');
	divContainer.appendChild(btnAdd);
	divContainer.appendChild(btnRemove);
	divAdvanced.appendChild(divContainer);
}

function changeButtonState(btnGetJobs, selectElement) {
	if (!document.contains(selectElement)) return;
	const noSelectedOptions = !selectElement.selectedOptions.length;
	btnGetJobs.disabled = noSelectedOptions;
}

const buttonFactory = (btnClass, textContent, func) => {
	const newButton = document.createElement('button');
	newButton.classList.add(btnClass);
	newButton.type = 'button';
	newButton.textContent = textContent;
	newButton.addEventListener('click', func);
	return newButton;
};

const createAddButton = () => buttonFactory('btn-add', 'Add', handleAddClick);

const createRemoveButton = () =>
	buttonFactory('btn-remove', 'Remove', handleRemoveClick);

const handleLogout = async () => {
	const btnLogout = document.querySelector('.btn-logout');
	const btnDeleteUser = document.querySelector('.btn-delete-account');
	const btnAdd = document.querySelector('.btn-add');
	const btnRemove = document.querySelector('.btn-remove');
	const btnGetJobs = document.querySelector('.get-listings');
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	const divAdvancedContainer = document.querySelector('.advanced-container');

	try {
		// Log user out
		await logUserOut();

		// Replace logout with login button
		btnLogout.replaceWith(btnLogin);

		// Replace delete with register button
		if (btnDeleteUser) btnDeleteUser.replaceWith(btnRegister);

		// Remove the add configs button
		btnAdd.parentNode.removeChild(btnAdd);

		// Remove the remove configs button
		btnRemove.parentNode.removeChild(btnRemove);

		// Update DOM
		const selectPremade = document.querySelector('#premade-configs');
		const areSelectedOptions = selectPremade.selectedOptions.length;
		if (areSelectedOptions) selectPremade.selectedIndex = -1;
		changeButtonState(btnGetJobs, selectPremade);

		inputEmail.disabled = false;
		inputPassword.disabled = false;
		inputEmail.value = '';
		inputPassword.value = '';

		divAdvancedContainer.style.display = 'none';
	} catch (err) {
		await logMessage('error', err.message);
	}
};

const handleAccountDeletion = async () => {
	const strWarning =
		'Are you sure you want to delete your account?\nAll user data will be lost. This includes: email, password, and site configurations.';
	if (!confirm(strWarning)) {
		alert('Account has not been deleted.');
	} else {
		try {
			await deleteUser();
			cleanUpAccountDeletion();
			alert('Account deleted successfully.\nEnjoy your new job! :)');
		} catch (err) {
			await logMessage('error', err.message);
		}
	}
};

const handleAddClick = async () => {
	const selectElement = document.getElementById('user-configs');
	const inputName = document.getElementById('siteName');
	const newOption = document.createElement('option');
	newOption.textContent = inputName.value;
	try {
		const id = await addConfig();
		newOption.value = id;
		selectElement.appendChild(newOption);
	} catch (err) {
		await logMessage('error', err.message);
	}
};

const handleRemoveClick = async () => {
	const selectElement = document.getElementById('user-configs');
	const selectedOptions = Array.from(selectElement.options).filter(
		(option) => option.selected
	);
	await removeConfig(selectedOptions);
	selectedOptions.forEach((option) => {
		option.remove();
	});
};

export {
	cleanUpAccountDeletion,
	createConfigButtons,
	createDeleteAccountButton,
	createLogoutButton,
	changeButtonState,
};
