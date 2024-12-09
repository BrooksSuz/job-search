const ut = {
	url: 'https://careers.utoledo.edu/cw/en-us/listing/',
	siteName: 'University of Toledo',
	canWait: false,
	consent: '',
	errorMessages: 'Node is either not clickable or not an Element',
	isAnchor: true,
	listing: 'h4 > a.job-link',
	nextPageDisabled: '',
	nextPageLink: "#recent-jobs a[title='More Jobs']:nth-of-type(1)",
	nextPageParent: '',
};

const arrConfigs = [ut];

export default arrConfigs;
