const em = {
	url: 'https://careers.emich.edu/jobs/search',
	siteName: 'Eastern Michigan',
	canWait: true,
	consent: 'button#consent_agree',
	errorMessages: 'Node is either not clickable or not an Element',
	isAnchor: true,
	listing: 'h3.card-title > a[id^="link_job_title"]',
	nextPageDisabled: 'disabled',
	nextPageLink: 'li.next_page > a',
	nextPageParent: '',
};

const um = {
	url: 'https://careers.umich.edu/browse-jobs/positions/F',
	siteName: 'University of Michigan',
	canWait: true,
	consent: '',
	errorMessages: "Waiting for selector `a[title='Go to next page']`",
	isAnchor: true,
	listing: 'a[href^="/job_detail/"]',
	nextPageDisabled: '',
	nextPageLink: "a[title='Go to next page']",
	nextPageParent: '',
};

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

const bg = {
	url: 'https://www.schooljobs.com/careers/bgsu',
	siteName: 'Bowling Green State University',
	canWait: false,
	consent: '',
	errorMessages: '',
	isAnchor: true,
	listing: 'a[href^="/careers/bgsu/jobs/"]',
	nextPageDisabled: 'disabled',
	nextPageLink: '.pagination-container a[aria-label="Go to Next Page"]',
	nextPageParent:
		'li.PagedList-skipToNext:has(> a[aria-label="Go to Next Page"])',
};

const owens = {
	url: 'https://owens.wd1.myworkdayjobs.com/OCC',
	siteName: 'Owens Community College',
	canWait: false,
	consent: '',
	errorMessages: 'Waiting for selector `button[aria-label="next"]`',
	isAnchor: false,
	listing:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabled: '',
	nextPageLink: 'button[aria-label="next"]',
	nextPageParent: '',
};

const osu = {
	url: 'https://osu.wd1.myworkdayjobs.com/OSUCareers',
	siteName: 'Ohio State University',
	canWait: false,
	consent: '',
	errorMessages: 'Waiting for selector `button[aria-label="next"]`',
	isAnchor: false,
	listing:
		'section[data-automation-id="jobResults"] a[data-automation-id="jobTitle"]',
	nextPageDisabled: '',
	nextPageLink: 'button[aria-label="next"]',
	nextPageParent: '',
};

const arrConfigs = [em, um, bg, owens, osu];

export default arrConfigs;
