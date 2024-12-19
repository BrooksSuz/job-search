import {
  alphabetizeConfigs,
  buttonFactory,
  changeSelectElement,
  cleanUpDOM,
  createConfigButtons,
  executeJobSearch,
  fetchPremadeConfigs,
  fetchSelected,
  startSpinner,
} from './js/index.js';

// Get premade configurations
document.addEventListener('DOMContentLoaded', handlePremadeLoad);

// Run main program logic
const btnGetListings = document.querySelector('.get-listings');
btnGetListings.addEventListener('click', handleListingsClick);

// Log in
const btnLogin = document.querySelector('.btn-login');
btnLogin.addEventListener('click', handleLogin);

// Register
const btnRegister = document.querySelector('.btn-register');
btnRegister.addEventListener('click', handleRegister);

// Hold premade select element in memory
const selectPremade = document.getElementById('premade-configs');

async function handlePremadeLoad() {
  try {
    // Fetch premade configs
    const arrPremadeConfigs = await fetchPremadeConfigs();

    // Populate the select element
    arrPremadeConfigs.forEach((objConfig) => {
      const newOption = document.createElement('option');
      newOption.value = objConfig._id;
      newOption.textContent = objConfig.siteName;
      selectPremade.appendChild(newOption);
    });
  } catch (err) {
    console.error('Error in function handlePremadeLoad:', err);
  }
}

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

async function handleLogin() {
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');
  let btnLogout = null;
  let btnDeleteAccount = null;
  try {
    // Log user in
    const response = await logUserIn();
    const arrSites = await response.json().then((res) => res.user.sites);

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
    console.error('Error in function handleLogin', err);
  }
}

async function handleRegister() {
  try {
    const boolSuccessful = await registerUser();
    if (boolSuccessful) {
      await handleLogin();
    }
  } catch (err) {
    console.error('Error in function handleRegister', err);
  }
}

const getUserCredentials = () => {
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();
  return { email, password };
};

const logUserIn = async () => {
  const { email, password } = getUserCredentials();

  // Guard clause: Empty inputs
  if (!email || !password) {
    alert('Email and password cannot be empty.');
    return;
  }

  try {
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
  } catch (err) {
    console.error('Error in function logUserIn:', err);
  }
};

const registerUser = async () => {
  const { email, password } = getUserCredentials();

  // Guard clause: Empty inputs
  if (!email || !password) console.error('Email and password cannot be empty.');

  try {
    // Create the user's account
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
    console.error('Error in function registerUser', err);
  }
};

const logUserOut = async () => {
  try {
    // Log the user out
    await fetch('/auth/logout');

    // Replace user with premade select element
    const selectUser = document.getElementById('user-configs');
    selectUser.replaceWith(selectPremade);
  } catch (err) {
    console.error('Error in function logUserOut:', err);
  }
};

const handleLogout = async () => {
  const btnLogout = document.querySelector('.btn-logout');
  const btnDeleteUser = document.querySelector('.btn-delete-account');
  const btnAdd = document.querySelector('.btn-add');
  const btnRemove = document.querySelector('.btn-remove');
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');

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

    // Disable and reset email and password inputs
    inputEmail.disabled = false;
    inputPassword.disabled = false;
    inputEmail.value = '';
    inputPassword.value = '';
  } catch (err) {
    console.error('Error in function handleLogout', err);
  }
};

const createLogoutButton = () =>
  buttonFactory('btn-logout', 'Logout', handleLogout);

const cleanUpAccountDeletion = () => {
  // Get EVERYTHING
  const inputOldEmail = document.querySelector('.email');
  const inputOldPassword = document.querySelector('.password');
  const btnLogout = document.querySelector('.btn-logout');
  const btnDeleteAccount = document.querySelector('.btn-delete-account');
  const selectUser = document.getElementById('user-configs');

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
  selectUser.replaceWith(selectPremade);

  // Leave 'em a happy message
  alert('Account deleted successfully.\n\nI hope you enjoy your new job. :)');
};

const handleAccountDeletion = async () => {
  try {
    const response = await fetch('/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Guard clause: Account deletion failure
    if (!response.ok) {
      const error = await response.json();
      console.error('Error deleting user:', error);
      alert(`Failed to delete user:\n\n${error.message}`);
    }

    // Clean up the DOM
    cleanUpAccountDeletion();
  } catch (err) {
    console.error('Error in function handleAccountDeletion:', err);
  }
};

const createDeleteAccountButton = () =>
  buttonFactory('btn-delete-account', 'Delete Account', handleAccountDeletion);
