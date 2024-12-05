function handleError(err, errMessages, functionName) {
  if (errMessages) {
    const isExpectedError = compareErrorMessage(errMessages.split(','), err);
    chooseMessage(isExpectedError, functionName, err);
  } else {
    console.log('\nNo provided expected errors.\n\nCarrying on...\n');
  }
}

const compareErrorMessage = (arr, err) =>
  arr.some(
    (expectedError) =>
      err.message.includes(expectedError) || expectedError.includes(err.message)
  );

const chooseMessage = (bool, functionName, err) => {
  if (bool) {
    console.log(
      `\nExpected error in function ${functionName}.\nAssuming last page reached.\n`
    );
  } else {
    console.error(`\nUnexpected error in function ${functionName}:\n\n`, err);
  }
};

export default handleError;
