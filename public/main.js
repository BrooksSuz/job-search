import * as authFrontend from './js/auth-frontend.js';
import * as helpers from './js/helpers.js';
import executeJobSearch from './js/job-search.js';
import * as uiControllers from './js/ui-controllers.js';
// Get premade configurations
document.addEventListener('DOMContentLoaded', onLoadGetPremade);

// Run main program logic
const btnGetListings = document.querySelector('.get-listings');
btnGetListings.addEventListener('click', handleListings);

// Log in
const btnLogin = document.querySelector('.login');
btnLogin.addEventListener('click', handleLogin);

// Log out
const btnLogout = document.querySelector('.logout');
btnLogout.addEventListener('click', handleLogout);

// Register
const btnRegister = document.querySelector('.register');
btnRegister.addEventListener('click', handleRegister);

async function handleListings() {
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
}

async function onLoadGetPremade() {
  const arrPremadeConfigs = await uiControllers.fetchPremadeConfigs();
  const selectPremade = document.getElementById('premade-configs');
  arrPremadeConfigs.forEach((objConfig) => {
    const newOption = document.createElement('option');
    newOption.value = objConfig._id;
    newOption.textContent = objConfig.siteName;
    selectPremade.appendChild(newOption);
  });
}

async function handleLogin() {
  const btnLogin = document.querySelector('.login');
  const btnLogout = document.querySelector('.logout');
  try {
    const response = await authFrontend.logUserIn();
    const arrSites = await response.json().then((res) => res.user.sites);
    await authFrontend.changeSelectElement(arrSites);
    await authFrontend.swapButtons(btnLogin, btnLogout);
    await authFrontend.createConfigButtons();
    await authFrontend.createDeleteAccountButton();

    const inputEmail = document.querySelector('.email');
    const inputPassword = document.querySelector('.password');
    inputEmail.disabled = true;
    inputPassword.disabled = true;
  } catch (err) {
    console.error('Error in function onLoginClick');
    throw err;
  }
}

async function handleLogout() {
  const btnLogin = document.querySelector('.login');
  const btnLogout = document.querySelector('.logout');
  const btnRegister = document.createElement('button');
  btnRegister.type = 'button';
  btnRegister.classList.add('register');
  btnRegister.textContent = 'Register';
  btnRegister.addEventListener('click', handleRegister);
  try {
    await authFrontend.logUserOut();
    await swapButtons(btnLogout, btnLogin);
    const btnDeleteUser = document.getElementById('btn-delete-account');
    btnDeleteUser.replaceWith(btnRegister);
  } catch (err) {
    console.error('Error in function onLogoutClick', err);
  }

  const btnAdd = document.getElementById('btn-add');
  if (btnAdd) btnAdd.parentNode.removeChild(btnAdd);

  const btnRemove = document.getElementById('btn-remove');
  if (btnRemove) btnRemove.parentNode.removeChild(btnRemove);

  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');
  inputEmail.disabled = false;
  inputEmail.value = '';
  inputPassword.disabled = false;
  inputPassword.value = '';
}

async function handleRegister() {
  try {
    const boolSuccessful = await authFrontend.registerUser();
    if (boolSuccessful) {
      await handleLogin();
    }
  } catch (err) {
    console.error('Error in function onRegisterClick', err);
    return;
  }
}

export { handleRegister };
