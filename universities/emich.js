import scrapeJobs from '../functions/scrape-jobs.js';

const eMichJobSearchConfig = {
  url: 'https://careers.emich.edu/jobs/search',
  btnConsentSelector: 'button#consent_agree',
  searchTerms: ['web'],
  jobTitleSelector: 'a[id^="link_job_title"]',
  nextPageSelector: 'li.next_page > a',
  nextPageDisabledClass: 'disabled',
  errMessage: null,
  uniName: 'Eastern Michigan',
};

(async () => {
  const arrUserSelections = [eMichJobSearchConfig];

  for (const selection of arrUserSelections) {
    await scrapeJobs(selection);
  }
})();
