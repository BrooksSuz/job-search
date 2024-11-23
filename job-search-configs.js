const em = {
	baseUrl: 'https://careers.emich.edu/jobs/search',
	uniName: 'Eastern Michigan',
	canWaitForNavigation: true,
	consentButton: 'button#consent_agree',
	errMessage: [
		'Navigation timeout of',
		'Node is either not clickable or not an Element',
	],
	isAnchor: true,
	jobTitleLink: 'h3.card-title > a[id^="link_job_title"]',
	nextPageDisabledClass: 'disabled',
	nextPageLink: 'li.next_page > a',
};

const um = {
	baseUrl: 'https://careers.umich.edu/browse-jobs/positions/F',
	uniName: 'University of Michigan',
	canWaitForNavigation: true,
	consentButton: null,
	errMessage: [
		'Navigation timeout of',
		"Waiting for selector `a[title='Go to next page']`",
	],
	isAnchor: true,
	jobTitleLink: 'a[href^="/job_detail/"]',
	nextPageDisabledClass: 'disabled',
	nextPageLink: "a[title='Go to next page']",
};

const ut = {
	baseUrl: 'https://careers.utoledo.edu/cw/en-us/listing/',
	uniName: 'University of Toledo',
	canWaitForNavigation: false,
	consentButton: null,
	errMessage: [
		'Node is either not clickable or not an Element',
		'TimeoutError: Waiting failed:',
	],
	isAnchor: true,
	jobTitleLink: 'h4 > a.job-link',
	nextPageDisabledClass: null,
	nextPageLink: "#recent-jobs a[title='More Jobs']:nth-of-type(1)",
};

const bg = {
	baseUrl: 'https://www.schooljobs.com/careers/bgsu',
	uniName: 'Bowling Green State University',
	canWaitForNavigation: false,
	consentButton: null,
	errMessage: [],
	isAnchor: true,
	jobTitleLink: 'a[href^="/careers/bgsu/jobs/"]',
	nextPageDisabledClass: null,
	nextPageLink: '.pagination-container a[aria-label="Go to Next Page"]',
};

const owens = {
	baseUrl: 'https://owens.wd1.myworkdayjobs.com/OCC',
	uniName: 'Owens Community College',
	canWaitForNavigation: false,
	consentButton: null,
	errMessage: [
		'Waiting for selector `button[aria-label="next"]`',
		'TimeoutError: Waiting failed:',
	],
	isAnchor: false,
	jobTitleLink:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabledClass: null,
	nextPageLink: 'button[aria-label="next"]',
};

const osu = {
	baseUrl: 'https://osu.wd1.myworkdayjobs.com/OSUCareers',
	uniName: 'Ohio State University',
	canWaitForNavigation: false,
	consentButton: null,
	errMessage: [
		'Waiting for selector `button[aria-label="next"]`',
		'TimeoutError: Waiting failed:',
	],
	isAnchor: false,
	jobTitleLink:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabledClass: null,
	nextPageLink: 'button[aria-label="next"]',
};

const configs = [em, um, ut, bg, owens, osu];

export default configs;
