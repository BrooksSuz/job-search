const eMich = {
  urlInfo: {
    baseUrl: 'https://careers.emich.edu/jobs/search',
  },
  selectors: {
    consentButton: 'button#consent_agree',
    jobTitleLink: 'a[id^="link_job_title"]',
    nextPageLink: 'li.next_page > a',
  },
  settings: {
    searchTerms: ['part-time lecturer'],
    nextPageDisabledClass: 'disabled',
    errMessage: null,
    uniName: 'Eastern Michigan',
  },
};

const uMich = {
  urlInfo: {
    baseUrl: 'https://careers.umich.edu/browse-jobs/positions/F',
  },
  selectors: {
    consentButton: null,
    jobTitleLink: 'table.cols-5 td.views-field-title > a',
    nextPageLink: "a[title='Go to next page']",
  },
  settings: {
    searchTerms: ['assistant director'],
    nextPageDisabledClass: 'disabled',
    errMessage:
      "Waiting for selector `a[title='Go to next page']` failed: Waiting failed: 10000ms exceeded",
    uniName: 'University of Michigan',
  },
};

const uToledo = {
  urlInfo: {
    baseUrl: 'https://careers.utoledo.edu/cw/en-us/listing/',
  },
  selectors: {
    consentButton: null,
    jobTitleLink: 'div.job_resultslist h4 > a.job-link',
    nextPageLink: "#recent-jobs a[title='More Jobs']",
  },
  settings: {
    searchTerms: ['web'],
    nextPageDisabledClass: null,
    errMessage: null,
    uniName: 'University of Toledo',
  },
};

const configs = [eMich];

export default configs;
