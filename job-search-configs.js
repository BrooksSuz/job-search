const eMich = {
  baseUrl: 'https://careers.emich.edu/jobs/search',
  uniName: 'Eastern Michigan',
  canWaitForNavigation: true,
  consentButton: 'button#consent_agree',
  errMessage: null,
  jobTitleLink: 'a[id^="link_job_title"]',
  nextPageDisabledClass: 'disabled',
  nextPageLink: 'li.next_page > a',
  searchTerms: ['visiting faculty'],
};

const uMich = {
  baseUrl: 'https://careers.umich.edu/browse-jobs/positions/F',
  uniName: 'University of Michigan',
  canWaitForNavigation: true,
  consentButton: null,
  errMessage:
    "Waiting for selector `a[title='Go to next page']` failed: Waiting failed: 5000ms exceeded",
  jobTitleLink: 'table.cols-5 td.views-field-title > a',
  nextPageDisabledClass: 'disabled',
  nextPageLink: "a[title='Go to next page']",
  searchTerms: ['research fellow'],
};

const uToledo = {
  baseUrl: 'https://careers.utoledo.edu/cw/en-us/listing/',
  uniName: 'University of Toledo',
  canWaitForNavigation: false,
  consentButton: null,
  errMessage: 'Node is either not clickable or not an Element',
  jobTitleLink: 'div.job_resultslist h4 > a.job-link',
  nextPageDisabledClass: null,
  nextPageLink: "#recent-jobs a[title='More Jobs']:nth-of-type(1)",
  searchTerms: [
    'Assistant Professor - Department of Orthopaedic Surgery - Orthopedic Trauma Surgery - 494263',
  ],
};

const configs = [uMich];

export default configs;
