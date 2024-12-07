function createHtml(strOrgName, arrDesiredListings, getCount) {
	// Guard clause: No listings
	if (!arrDesiredListings.length) return createEmptyDiv(strOrgName, getCount);
	const arrAnchors = arrDesiredListings.map((listing) => {
		const [[strTitle, strUrl]] = Object.entries(listing);
		return createAnchor(strTitle, strUrl);
	});
	return createPopulatedDiv(strOrgName, arrAnchors, getCount);
}

const createAnchor = (strTitle, strUrl) =>
	`<a href='${strUrl}' target='_blank'>${strTitle}</a>`;

const createPopulatedDiv = (strOrgName, arrAnchors, getCount) =>
	`
		<div class='container-org'>
			<h2>Results for ${strOrgName}:</h2>
			<p>(${getCount()} Pages Scraped)</p>
			<ul class='flex'>
				${arrAnchors.map((strAnchor) => `<li>${strAnchor}</li>`).join('')}
			</ul>
		</div>
	`;

const createEmptyDiv = (strOrgName, getCount) =>
	`
		<div class='container-org'>
			<h2>Results for ${strOrgName}:</h2>
			<p>(${getCount()} Pages Scraped)</p>
			<p>No results with provided keywords.</p>
		</div>
	`;

export default createHtml;
