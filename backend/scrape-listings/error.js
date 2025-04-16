import { logger } from '../logger-backend.js';

function handleError(err, arrErrorMessages, strFunctionName) {
	// Guard clause: No errors provided
	if (!arrErrorMessages.length) {
		logger.info('\nNo provided expected errors.\nCarrying on...');
		return;
	}

	// Decide if the error is expected
	const boolIsExpectedError = compareErrorMessage(err, arrErrorMessages);

	// Choose the appropriate message
	chooseErrorMessage(err, boolIsExpectedError, strFunctionName);
}

function throwErrorAndHalt(err, strFunctionName) {
	logger.error(
		`\nUnexpected error in function ${strFunctionName}:\n\n${err.message}`
	);
}

const compareErrorMessage = (err, arrErrorMessages) =>
	arrErrorMessages.some(
		(expectedError) =>
			err.message.includes(expectedError) || expectedError.includes(err.message)
	);

const chooseErrorMessage = (err, boolIsExpectedError, strFunctionName) => {
	if (boolIsExpectedError) {
		logger.info(
			`\nExpected error in function ${strFunctionName}. Assuming last page reached.`
		);
	} else {
		throwErrorAndHalt(err, strFunctionName);
	}
};

export { handleError, throwErrorAndHalt };
