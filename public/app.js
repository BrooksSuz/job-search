import executeJobSearch from '../backend/scraper.js';

const arrCompletedListings = await executeJobSearch(['assis']);

const formattedListings = arrCompletedListings
  .map((objUni) => {
    const [[uniName, arrUniObjects]] = Object.entries(objUni);
    if (arrUniObjects) {
      const arrAnchors = arrUniObjects.map((listing) => {
        const [[title, url]] = Object.entries(listing);
        if (listing) {
          return `<a href='${url}' target='_blank'>${title}</a>`;
        }
      });

      const finished = `
        <div>
          <h2>Results for ${uniName}:</h2>\n
          <ul>
            ${arrAnchors.map((anchor) => `<li>${anchor}</li>`).join('')}
          </ul>
        </div>
      `;
      return finished;
    }
  })
  .join('');

const html = `<div><h1>Your Morning's Scraped Listings: </h1>${formattedListings}</div>`;
