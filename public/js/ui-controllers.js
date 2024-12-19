import { getPrefix } from './helpers.js';

const fetchPremadeConfigs = async () => {
  try {
    const response = await fetch('/api/premade');
    if (!response.ok) throw new Error('Unauthorized');
    return await response.json();
  } catch (err) {
    console.error('Error in function fetchPremadeConfigs', err);
  }
};

const fetchSelected = async () => {
  const strSelectIdSliced = getPrefix();
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
    console.error('Error in function fetchSelected', err);
  }
};

export { fetchPremadeConfigs, fetchSelected };
