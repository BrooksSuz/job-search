const eMichJobSearchConfig = {
  url: 'https://careers.emich.edu/jobs/search',
  btnConsentSelector: 'button#consent_agree',
  searchTerms: ['part-time lecturer'],
  jobTitleSelector: 'a[id^="link_job_title"]',
  nextPageSelector: 'li.next_page > a',
  nextPageDisabledClass: 'disabled',
  errMessage: null,
  uniName: 'Eastern Michigan',
};

const uMichJobSearchConfig = {
  url: 'https://careers.umich.edu/browse-jobs/positions/F',
  btnConsentSelector: null, // Assuming there's no consent button
  searchTerms: ['research laboratory tech assoc'],
  jobTitleSelector: 'table.cols-5 td.views-field-title > a',
  nextPageSelector: "a[title='Go to next page']",
  nextPageDisabledClass: 'disabled',
  errMessage:
    "Waiting for selector `a[title='Go to next page']` failed: Waiting failed: 10000ms exceeded",
  uniName: 'University of Michigan',
};

const uToledoSearchConfig = {
  url: 'https://careers.utoledo.edu/cw/en-us/listing/',
  btnConsentSelector: null,
  searchTerms: ['web'],
  jobTitleSelector: 'div.job_resultslist h4 > a.job-link',
  nextPageSelector: "#recent-jobs a[title='More Jobs']",
  nextPageDisabledClass: null,
  errMessage: null,
  uniName: 'University of Toledo',
};

const jobSearchConfigs = [eMichJobSearchConfig, uMichJobSearchConfig];

export default jobSearchConfigs;
