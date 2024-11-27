const em = {
	url: 'https://careers.emich.edu/jobs/search',
	uniName: 'Eastern Michigan',
	canWaitForNavigation: true,
	consentButton: 'button#consent_agree',
	errMessages: ['Node is either not clickable or not an Element'],
	isAnchor: true,
	jobTitleLink: 'h3.card-title > a[id^="link_job_title"]',
	nextPageDisabledClass: 'disabled',
	nextPageLink: 'li.next_page > a',
	nextPageParentSelector: null,
};

const um = {
	url: 'https://careers.umich.edu/browse-jobs/positions/F',
	uniName: 'University of Michigan',
	canWaitForNavigation: true,
	consentButton: null,
	errMessages: ["Waiting for selector `a[title='Go to next page']`"],
	isAnchor: true,
	jobTitleLink: 'a[href^="/job_detail/"]',
	nextPageDisabledClass: null,
	nextPageLink: "a[title='Go to next page']",
	nextPageParentSelector: null,
};

const ut = {
	url: 'https://careers.utoledo.edu/cw/en-us/listing/',
	uniName: 'University of Toledo',
	canWaitForNavigation: false,
	consentButton: null,
	errMessages: ['Node is either not clickable or not an Element'],
	isAnchor: true,
	jobTitleLink: 'h4 > a.job-link',
	nextPageDisabledClass: null,
	nextPageLink: "#recent-jobs a[title='More Jobs']:nth-of-type(1)",
	nextPageParentSelector: null,
};

const bg = {
	url: 'https://www.schooljobs.com/careers/bgsu',
	uniName: 'Bowling Green State University',
	canWaitForNavigation: false,
	consentButton: null,
	errMessages: null,
	isAnchor: true,
	jobTitleLink: 'a[href^="/careers/bgsu/jobs/"]',
	nextPageDisabledClass: 'disabled',
	nextPageLink: '.pagination-container a[aria-label="Go to Next Page"]',
	nextPageParentSelector:
		'li.PagedList-skipToNext:has(> a[aria-label="Go to Next Page"])',
};

const owens = {
	url: 'https://owens.wd1.myworkdayjobs.com/OCC',
	uniName: 'Owens Community College',
	canWaitForNavigation: false,
	consentButton: null,
	errMessages: ['Waiting for selector `button[aria-label="next"]`'],
	isAnchor: false,
	jobTitleLink:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabledClass: null,
	nextPageLink: 'button[aria-label="next"]',
	nextPageParentSelector: null,
};

const osu = {
	url: 'https://osu.wd1.myworkdayjobs.com/OSUCareers',
	uniName: 'Ohio State University',
	canWaitForNavigation: false,
	consentButton: null,
	errMessages: ['Waiting for selector `button[aria-label="next"]`'],
	isAnchor: false,
	jobTitleLink:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabledClass: null,
	nextPageLink: 'button[aria-label="next"]',
	nextPageParentSelector: null,
};

const configs = [em];

export default configs;
