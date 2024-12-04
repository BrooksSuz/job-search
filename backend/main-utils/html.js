import { countObj } from '../server.js';

function createHtmlListings(siteListings) {
  const [[name, arrConfigObjects]] = Object.entries(siteListings);
  // Guard Clause: No listings
  if (!arrConfigObjects.length) return createEmptyDiv(name);

  const anchors = arrConfigObjects.map((listing) => createAnchor(listing));
  return createPopulatedDiv(name, anchors);
}

const createAnchor = (listing) => {
  const [[title, url]] = Object.entries(listing);
  if (listing) return `<a href='${url}' target='_blank'>${title}</a>`;
};

const createPopulatedDiv = (name, arrAnchors) => `
	<div class='container-org'>
		<h2>Results for ${name}:</h2>
		<p>(${countObj.count} pages scraped)</p>
		<ul class='flex'>
			${arrAnchors.map((anchor) => `<li>${anchor}</li>`).join('')}
		</ul>
	</div>
`;

const createEmptyDiv = (name) => `
	<div class='container-org'>
		<h2>Results for ${name}:</h2>
		<p>(${countObj.count} pages scraped)</p>
		<p>No results with provided keywords.</p>
	</div>
`;

export default createHtmlListings;
