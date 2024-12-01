const em = {
	url: 'https://careers.emich.edu/jobs/search',
	name: 'Eastern Michigan',
	canWaitForNavigation: true,
	consentButton: 'button#consent_agree',
	errMessages: 'Node is either not clickable or not an Element',
	isAnchor: true,
	jobTitleLink: 'h3.card-title > a[id^="link_job_title"]',
	nextPageDisabledClass: 'disabled',
	nextPageLink: 'li.next_page > a',
	nextPageParentSelector: '',
};

const um = {
	url: 'https://careers.umich.edu/browse-jobs/positions/F',
	name: 'University of Michigan',
	canWaitForNavigation: true,
	consentButton: '',
	errMessages: "Waiting for selector `a[title='Go to next page']`",
	isAnchor: true,
	jobTitleLink: 'a[href^="/job_detail/"]',
	nextPageDisabledClass: '',
	nextPageLink: "a[title='Go to next page']",
	nextPageParentSelector: '',
};

const ut = {
	url: 'https://careers.utoledo.edu/cw/en-us/listing/',
	name: 'University of Toledo',
	canWaitForNavigation: false,
	consentButton: '',
	errMessages: 'Node is either not clickable or not an Element',
	isAnchor: true,
	jobTitleLink: 'h4 > a.job-link',
	nextPageDisabledClass: '',
	nextPageLink: "#recent-jobs a[title='More Jobs']:nth-of-type(1)",
	nextPageParentSelector: '',
};

const bg = {
	url: 'https://www.schooljobs.com/careers/bgsu',
	name: 'Bowling Green State University',
	canWaitForNavigation: false,
	consentButton: '',
	errMessages: '',
	isAnchor: true,
	jobTitleLink: 'a[href^="/careers/bgsu/jobs/"]',
	nextPageDisabledClass: 'disabled',
	nextPageLink: '.pagination-container a[aria-label="Go to Next Page"]',
	nextPageParentSelector:
		'li.PagedList-skipToNext:has(> a[aria-label="Go to Next Page"])',
};

const owens = {
	url: 'https://owens.wd1.myworkdayjobs.com/OCC',
	name: 'Owens Community College',
	canWaitForNavigation: false,
	consentButton: '',
	errMessages: 'Waiting for selector `button[aria-label="next"]`',
	isAnchor: false,
	jobTitleLink:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabledClass: '',
	nextPageLink: 'button[aria-label="next"]',
	nextPageParentSelector: '',
};

const osu = {
	url: 'https://osu.wd1.myworkdayjobs.com/OSUCareers',
	name: 'Ohio State University',
	canWaitForNavigation: false,
	consentButton: '',
	errMessages: 'Waiting for selector `button[aria-label="next"]`',
	isAnchor: false,
	jobTitleLink:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabledClass: '',
	nextPageLink: 'button[aria-label="next"]',
	nextPageParentSelector: '',
};

const configs = [bg];

export default configs;
