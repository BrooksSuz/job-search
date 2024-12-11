const em = {
	consent: 'button#consent_agree',
	errorMessages: 'Node is either not clickable or not an Element',
	isAnchor: true,
	listing: 'h3.card-title > a[id^="link_job_title"]',
	nextPageDisabled: 'disabled',
	nextPageLink: 'li.next_page > a',
	nextPageParent: '',
	siteName: 'Eastern Michigan',
	url: 'https://careers.emich.edu/jobs/search',
};

const um = {
	consent: '',
	errorMessages: "Waiting for selector `a[title='Go to next page']`",
	isAnchor: true,
	listing: 'a[href^="/job_detail/"]',
	nextPageDisabled: '',
	nextPageLink: "a[title='Go to next page']",
	nextPageParent: '',
	siteName: 'University of Michigan',
	url: 'https://careers.umich.edu/browse-jobs/positions/F',
};

const ut = {
	consent: '',
	errorMessages: 'Node is either not clickable or not an Element',
	isAnchor: true,
	listing: 'h4 > a.job-link',
	nextPageDisabled: '',
	nextPageLink: "#recent-jobs a[title='More Jobs']:nth-of-type(1)",
	nextPageParent: '',
	timeout: 10000,
	siteName: 'University of Toledo',
	url: 'https://careers.utoledo.edu/cw/en-us/listing/',
};

const bg = {
	consent: '',
	siteName: 'Bowling Green State University',
	errorMessages: '',
	isAnchor: true,
	listing: 'a[href^="/careers/bgsu/jobs/"]',
	nextPageDisabled: 'disabled',
	nextPageLink: '.pagination-container a[aria-label="Go to Next Page"]',
	nextPageParent:
		'li.PagedList-skipToNext:has(> a[aria-label="Go to Next Page"])',
	url: 'https://www.schooljobs.com/careers/bgsu',
};

const owens = {
	consent: '',
	siteName: 'Owens Community College',
	errorMessages: 'Waiting for selector `button[aria-label="next"]`',
	isAnchor: false,
	listing:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabled: '',
	nextPageLink: 'button[aria-label="next"]',
	nextPageParent: '',
	url: 'https://owens.wd1.myworkdayjobs.com/OCC',
};

const osu = {
	consent: '',
	siteName: 'Ohio State University',
	errorMessages: 'Waiting for selector `button[aria-label="next"]`',
	isAnchor: false,
	listing:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabled: '',
	nextPageLink: 'button[aria-label="next"]',
	nextPageParent: '',
	url: 'https://osu.wd1.myworkdayjobs.com/OSUCareers',
};

const arrConfigs = [owens, bg];

export default arrConfigs;
