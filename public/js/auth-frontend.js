import { getPrefix } from './helpers.js';

function changeSelectElement(arrSites) {
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
}

function createConfigButtons() {
  const divContainer = document.createElement('div');
  const divAdvanced = document.querySelector('.container-advanced');
  const btnAdd = createAddButton();
  const btnRemove = createRemoveButton();
  divContainer.classList.add('container-button');
  divContainer.append(btnAdd, btnRemove);
  divAdvanced.appendChild(divContainer);
}

function buttonFactory(btnClass, textContent, func) {
  const newButton = document.createElement('button');
  newButton.classList.add(btnClass);
  newButton.type = 'button';
  newButton.textContent = textContent;
  newButton.addEventListener('click', func);
  return newButton;
}

const createUserDataObject = () => {
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
  const objUserData = createUserDataObject();
  try {
    const response = await fetch('/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objUserData }),
    });
    return await response.json().then((res) => res.id);
  } catch (err) {
    console.error('Error in function addConfig', err);
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
    console.error('Error in function handleAddClick', err);
  }
};

const createAddButton = () => buttonFactory('btn-add', 'Add', handleAddClick);

const createRemoveButton = () =>
  buttonFactory('btn-remove', 'Remove', handleRemoveClick);

const removeConfig = async (selectedOptions) => {
  const selectedValues = selectedOptions.map((option) => option.value);
  try {
    await fetch('/api/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedValues }),
    });
  } catch (err) {
    console.error('Error in function removeConfig', err);
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

export { buttonFactory, changeSelectElement, createConfigButtons };
