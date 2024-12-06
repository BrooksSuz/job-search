import throwErrorAndHalt from '../../error.js';

function handleError(err, arrErrorMessages, strFunctionName) {
  // Guard clause: No errors provided
  if (!arrErrorMessages.length) {
    console.log('\nNo provided expected errors.\n\nCarrying on...\n');
    return;
  }

  // Decide if the error is expected
  const boolIsExpectedError = compareErrorMessage(
    err,
    arrErrorMessages.split(',')
  );

  // Choose the appropriate message
  chooseErrorMessage(err, boolIsExpectedError, strFunctionName);
}

const compareErrorMessage = (err, arrErrorMessages) =>
  arrErrorMessages.some(
    (expectedError) =>
      err.message.includes(expectedError) || expectedError.includes(err.message)
  );

const chooseErrorMessage = (err, boolIsExpectedError, strFunctionName) => {
  if (boolIsExpectedError) {
    console.log(
      `\nExpected error in function ${strFunctionName}.\nAssuming last page reached.\n`
    );
  } else {
    throwErrorAndHalt(err, 'chooseErrorMessage');
  }
};

export default handleError;
