const em = {
	baseUrl: 'https://careers.emich.edu/jobs/search',
	uniName: 'Eastern Michigan',
	canRunParallel: true,
	canWaitForNavigation: true,
	consentButton: 'button#consent_agree',
	errMessage: null,
	isAnchor: true,
	jobTitleLink: 'a[id^="link_job_title"]',
	nextPageDisabledClass: 'disabled',
	nextPageLink: 'li.next_page > a',
};

const um = {
	baseUrl: 'https://careers.umich.edu/browse-jobs/positions/F',
	uniName: 'University of Michigan',
	canRunParallel: true,
	canWaitForNavigation: true,
	consentButton: null,
	errMessage: "Waiting for selector `a[title='Go to next page']`",
	isAnchor: true,
	jobTitleLink: 'table.cols-5 td.views-field-title > a',
	nextPageDisabledClass: 'disabled',
	nextPageLink: "a[title='Go to next page']",
};

const ut = {
	baseUrl: 'https://careers.utoledo.edu/cw/en-us/listing/',
	uniName: 'University of Toledo',
	canRunParallel: false,
	canWaitForNavigation: false,
	consentButton: null,
	errMessage: 'Node is either not clickable or not an Element',
	isAnchor: true,
	jobTitleLink: 'div.job_resultslist h4 > a.job-link',
	nextPageDisabledClass: null,
	nextPageLink: "#recent-jobs a[title='More Jobs']:nth-of-type(1)",
};

const bg = {
	baseUrl: 'https://www.schooljobs.com/careers/bgsu',
	uniName: 'Bowling Green State University',
	canRunParallel: false,
	canWaitForNavigation: false,
	consentButton: null,
	errMessage: null,
	isAnchor: true,
	jobTitleLink: '.job-listing-container .item-details-link',
	nextPageDisabledClass: null,
	nextPageLink: '.pagination-container a[aria-label="Go to Next Page"]',
};

const owens = {
	baseUrl: 'https://owens.wd1.myworkdayjobs.com/OCC',
	uniName: 'Owens Community College',
	canWaitForNavigation: false,
	canRunParallel: true,
	consentButton: null,
	errMessage: 'Waiting for selector `button[aria-label="next"]`',
	isAnchor: false,
	jobTitleLink:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabledClass: null,
	nextPageLink: 'button[aria-label="next"]',
};

const configs = [em, um, ut, bg, owens];

export default configs;
