import { sliceId } from './helpers.js';
import { handleRegister } from '../main.js';

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

const createDataObject = () => {
  const inputsAdvanced = document.querySelectorAll(
    '.container-advanced > label input'
  );
  const objUserData = {};

  inputsAdvanced.forEach((input) => {
    const id = input.id;
    if (input.type === 'checkbox') {
      objUserData[id] = input.checked;
    } else {
      objUserData[id] = input.value;
    }
  });

  return objUserData;
};

const addConfig = async () => {
  const objUserData = createDataObject();
  try {
    const response = await fetch('/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objUserData: objUserData }),
    });

    return response;
  } catch (err) {
    console.error('Error in function addConfig', err);
  }
};

const handleAdd = async () => {
  const selectElement = document.getElementById('user-configs');
  const inputName = document.getElementById('siteName');
  const newOption = document.createElement('option');
  newOption.textContent = inputName.value;
  try {
    const idJSON = await addConfig().then((res) => res.json());
    const id = await idJSON.id;
    newOption.value = id;
    selectElement.appendChild(newOption);
  } catch (err) {
    console.error('Error in function populateSelect', err);
  }
};

const createAddButton = () => {
  const btnAdd = document.createElement('button');
  btnAdd.id = 'btn-add';
  btnAdd.type = 'button';
  btnAdd.textContent = 'Add';
  btnAdd.addEventListener('click', handleAdd);
  return btnAdd;
};

const handleRemove = async () => {
  const selectElement = document.getElementById('user-configs');
  const selectedOptions = Array.from(selectElement.options).filter(
    (option) => option.selected
  );
  const selectedValues = selectedOptions.map((option) => option.value);
  try {
    await fetch('/api/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedValues: selectedValues }),
    });

    selectedOptions.forEach((option) => {
      option.remove();
    });
  } catch (err) {
    console.error('Error in function onRemoveClick', err);
  }
};

const createDeleteButton = () => {
  const btnRemove = document.createElement('button');
  btnRemove.id = 'btn-remove';
  btnRemove.type = 'button';
  btnRemove.textContent = 'Remove';
  btnRemove.addEventListener('click', handleRemove);
  return btnRemove;
};

async function handleAccountDeletion() {
  const inputEmail = document.createElement('input');
  const inputPassword = document.createElement('input');
  const inputOldEmail = document.querySelector('.email');
  const inputOldPassword = document.querySelector('.password');
  const btnLogin = document.querySelector('.login');
  const btnLogout = document.querySelector('.logout');
  const btnDeleteAccount = document.getElementById('btn-delete-account');
  const selectUser = document.getElementById('user-configs');
  inputEmail.type = 'email';
  inputEmail.classList.add('email');
  inputPassword.type = 'password';
  inputPassword.classList.add('password');
  try {
    const response = await fetch('/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
      return;
    }

    // Cleanup
    alert('Account deleted successfully');
    inputOldEmail.replaceWith(inputEmail);
    inputOldPassword.replaceWith(inputPassword);
    swapButtons(btnLogout, btnLogin);
    const btnRegister = document.createElement('button');
    btnRegister.type = 'button';
    btnRegister.classList.add('register');
    btnRegister.textContent = 'Register';
    btnRegister.addEventListener('click', handleRegister);
    btnDeleteAccount.replaceWith(btnRegister);
    const btnAdd = document.getElementById('btn-add');
    if (btnAdd) btnAdd.parentNode.removeChild(btnAdd);
    const btnRemove = document.getElementById('btn-remove');
    if (btnRemove) btnRemove.parentNode.removeChild(btnRemove);
    selectUser.replaceWith(selectPremade);
  } catch (err) {
    console.error('Network error:', err);
    alert('An error userIdoccurred while deleting the user.');
  }
}

const createDeleteAccountButton = async () => {
  const btnDeleteAccount = document.createElement('button');
  const btnRegister = document.querySelector('.register');
  btnDeleteAccount.id = 'btn-delete-account';
  btnDeleteAccount.type = 'button';
  btnDeleteAccount.textContent = 'Delete Account';
  btnDeleteAccount.addEventListener('click', handleAccountDeletion);
  btnRegister.replaceWith(btnDeleteAccount);
};

const createConfigButtons = async () => {
  const divContainer = document.createElement('div');
  const divAdvanced = document.querySelector('.container-advanced');
  const btnAdd = createAddButton();
  const btnRemove = createDeleteButton();
  divContainer.classList.add('container-button');
  divContainer.append(btnAdd, btnRemove);
  divAdvanced.appendChild(divContainer);
};

export {
  swapButtons,
  logUserIn,
  logUserOut,
  changeSelectElement,
  registerUser,
  createDeleteAccountButton,
  createConfigButtons,
};
