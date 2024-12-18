function handleError(err, arrErrorMessages, strFunctionName) {
	// Guard clause: No errors provided
	if (!arrErrorMessages.length) {
		console.log('\nNo provided expected errors.\nCarrying on...');
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

function throwErrorAndHalt(err, strFunctionName) {
	console.error(
		`\nUnexpected error in function ${strFunctionName}:\n\n`,
		err.message
	);
	process.exit(1);
}

const compareErrorMessage = (err, arrErrorMessages) =>
	arrErrorMessages.some(
		(expectedError) =>
			err.message.includes(expectedError) || expectedError.includes(err.message)
	);

const chooseErrorMessage = (err, boolIsExpectedError, strFunctionName) => {
	if (boolIsExpectedError) {
		console.log(
			`\nExpected error in function ${strFunctionName}.\nAssuming last page reached.`
		);
	} else {
		throwErrorAndHalt(err, strFunctionName);
	}
};

export { handleError, throwErrorAndHalt };
