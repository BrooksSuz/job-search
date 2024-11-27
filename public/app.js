fetch('/api/jobs')
  .then((res) => res.json())
  .then((strHtml) => {
    const divJobList = document.querySelector('.job-list');
    divJobList.innerHTML += strHtml;
  })
  .catch((err) => {
    console.error('Error fetching job data:', err);
  });
