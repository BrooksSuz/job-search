function handleError(params) {
  const { err, errMessages, functionName } = params;
  if (errMessages) {
    const arrErrMessages = errMessages.split(',');
    const isExpectedError = arrErrMessages.some(
      (expectedError) =>
        err.message.includes(expectedError) ||
        expectedError.includes(err.message)
    );

    if (isExpectedError) {
      console.log(
        `\nExpected error in function ${functionName}.\nAssuming last page reached.\n`
      );
    } else {
      console.error(`\nUnexpected error in function ${functionName}:\n\n`, err);
    }
  } else {
    console.log('\nNo provided expected errors.\n\nCarrying on...\n');
  }
}

export default handleError;
