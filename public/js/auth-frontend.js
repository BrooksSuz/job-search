import { changeButtonState } from './dom-manipulation.js';

// Store selectPremade reference
const selectPremade = document.querySelector('#premade-configs');

async function addConfig() {
	const objSiteData = createUserDataObject();
	try {
		const response = await fetch('/api/add-config', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ objSiteData }),
		});
		return await response.json().then((res) => res.id);
	} catch (err) {
		await logMessage('error', err.message);
	}
}

async function removeConfig(selectedOptions) {
	const selectedValues = selectedOptions.map((option) => option.value);
	try {
		await fetch('/api/remove-config', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ selectedValues }),
		});
	} catch (err) {
		await logMessage('error', err.message);
	}
}

async function logUserIn(email, password) {
	try {
		const user = await fetch('/api/user', {
			method: 'GET',
			credentials: 'include',
		}).then((res) => res.json());

		if (!user) {
			// Log the user in and return the response
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
		}
	} catch (err) {
		await logMessage('error', err.message);
	}
}

async function registerUser() {
	const { email, password } = getUserCredentials();

	// Guard clause: Empty inputs
	if (!email || !password) {
		Swal.fire('Email and password cannot be empty.');
		return;
	}
	try {
		// Create user's account
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

		// Guard clause: Failed registration
		if (!response.ok) {
			const data = await response.json();
			alert(data.message);

			// Prevent user from logging in
			return false;
		}

		// Log user in
		alert('Registration successful. Happy hunting!');
		return true;
	} catch (err) {
		await logMessage('error', err.message);
	}
}

async function logUserOut() {
	try {
		// Log user out
		await fetch('/auth/logout');

		// Replace user with premade select element
		const btnGetJobs = document.querySelector('.get-listings');
		const selectUser = document.getElementById('user-configs');
		selectUser.replaceWith(selectPremade);
		changeButtonState(btnGetJobs, selectPremade);
	} catch (err) {
		await logMessage('error', err.message);
	}
}

async function deleteUser() {
	try {
		const response = await fetch('/api/delete-user', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Guard clause: Account deletion failure
		if (!response.ok) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Unable to delete user. Try again later.',
			});
		}
	} catch (err) {
		await logMessage('error', err.message);
	}
}

const createUserDataObject = () => {
	const inputsAdvanced = document.querySelectorAll(
		'.advanced-container > label input'
	);
	const objSiteData = {};

	inputsAdvanced.forEach((input) => {
		const id = input.id;
		if (input.type === 'checkbox') {
			objSiteData[id] = input.checked;
		} else {
			objSiteData[id] = input.value;
		}
	});

	return objSiteData;
};

const getUserCredentials = () => {
	const inputEmail = document.querySelector('.email');
	const inputPassword = document.querySelector('.password');
	const email = inputEmail.value.trim();
	const password = inputPassword.value.trim();
	return { email, password };
};

export {
	addConfig,
	deleteUser,
	getUserCredentials,
	logUserIn,
	logUserOut,
	registerUser,
	removeConfig,
};
