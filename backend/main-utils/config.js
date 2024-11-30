function formatArguments(strSearchTerms, arrConfigs) {
	const searchTerms = strSearchTerms.split(',').map((term) => term.trim());
	const configs = alphabetizeConfigs(arrConfigs);
	return { searchTerms, configs };
}

const alphabetizeConfigs = (arr) =>
	arr.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

export default formatArguments;
