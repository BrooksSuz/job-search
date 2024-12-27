const logMessage = async (level, message) => {
	try {
		fetch('/api/log', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ level, message }),
		}).then((response) => response.json());
	} catch (err) {
		console.error('Error in function logMessage');
	}
};

export default logMessage;
