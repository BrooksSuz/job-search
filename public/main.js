import * as authFrontend from './js/auth-frontend.js';
import * as helpers from './js/helpers.js';
import executeJobSearch from './js/job-search.js';
import * as uiControllers from './js/ui-controllers.js';
// Get premade configurations
document.addEventListener('DOMContentLoaded', handlePremadeLoad);

// Run main program logic
const btnGetListings = document.querySelector('.get-listings');
btnGetListings.addEventListener('click', handleListingsClick);

// Log in
const btnLogin = document.querySelector('.login');
btnLogin.addEventListener('click', handleLogin);

// Log out
const btnLogout = document.querySelector('.logout');
btnLogout.addEventListener('click', handleLogout);

// Register
const btnRegister = document.querySelector('.register');
btnRegister.addEventListener('click', handleRegister);

async function handlePremadeLoad() {
  try {
    // Fetch premade configs
    const arrPremadeConfigs = await uiControllers.fetchPremadeConfigs();
    const selectPremade = document.getElementById('premade-configs');

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
  const stopSpinner = helpers.startSpinner(spanSpinner);

  try {
    // Get configs from database
    const arrConfigs = await uiControllers.fetchSelected();

    // Guard clause: No provided configs
    if (!arrConfigs.length) {
      helpers.cleanUpDOM(
        spanSpinner,
        stopSpinner,
        spanBtnListingsText,
        btnGetListings,
        inputsAdvanced
      );
      return;
    }

    // Alphabetize and consume API endpoint
    const arrAlphabetizedConfigs = helpers.alphabetizeConfigs(arrConfigs);
    await executeJobSearch(arrAlphabetizedConfigs).finally(() => {
      helpers.cleanUpDOM(
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
  const btnLogin = document.querySelector('.login');
  const btnLogout = document.querySelector('.logout');
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');
  try {
    // Log user in
    const response = await authFrontend.logUserIn();
    const arrSites = await response.json().then((res) => res.user.sites);

    // Update the DOM
    await authFrontend.changeSelectElement(arrSites);
    await authFrontend.swapButtons(btnLogin, btnLogout);
    await authFrontend.createConfigButtons();
    await authFrontend.createDeleteAccountButton();
    inputEmail.disabled = true;
    inputPassword.disabled = true;
  } catch (err) {
    console.error('Error in function handleLogin', err);
    return;
  }
}

async function handleLogout() {
  const btnLogin = document.querySelector('.login');
  const btnLogout = document.querySelector('.logout');
  const btnDeleteUser = document.getElementById('btn-delete-account');
  const btnAdd = document.getElementById('btn-add');
  const btnRemove = document.getElementById('btn-remove');
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');

  // Create register button
  const btnRegister = document.createElement('button');
  btnRegister.type = 'button';
  btnRegister.classList.add('register');
  btnRegister.textContent = 'Register';
  btnRegister.addEventListener('click', handleRegister);
  try {
    // Log user out
    await authFrontend.logUserOut();

    // Replace logout with login button
    await authFrontend.swapButtons(btnLogout, btnLogin);

    // Replace delete with register button
    if (btnDeleteUser) btnDeleteUser.replaceWith(btnRegister);

    // Remove the add configs button
    if (btnAdd) btnAdd.parentNode.removeChild(btnAdd);

    // Remove the remove configs button
    if (btnRemove) btnRemove.parentNode.removeChild(btnRemove);

    // Disable and reset email and password inputs
    if (inputEmail && inputPassword) {
      inputEmail.disabled = false;
      inputPassword.disabled = false;
      inputEmail.value = '';
      inputPassword.value = '';
    }
  } catch (err) {
    console.error('Error in function handleLogout', err);
  }
}

async function handleRegister() {
  try {
    const boolSuccessful = await authFrontend.registerUser();
    if (boolSuccessful) {
      await handleLogin();
    }
  } catch (err) {
    console.error('Error in function handleRegister', err);
    return;
  }
}

export { handleRegister };
