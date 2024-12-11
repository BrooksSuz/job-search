function createHtml(strsiteName, arrDesiredListings, getCount) {
	// Guard clause: No listings
	if (!arrDesiredListings.length) return createEmptyDiv(strsiteName, getCount);
	const arrAnchors = arrDesiredListings.map((objListing) => {
		const [[strTitle, strUrl]] = Object.entries(objListing);
		return createAnchor(strTitle, strUrl);
	});
	return createPopulatedDiv(strsiteName, arrAnchors, getCount);
}

const createAnchor = (strTitle, strUrl) =>
	`<a href='${strUrl}' target='_blank'>${strTitle}</a>`;

const createPopulatedDiv = (strsiteName, arrAnchors, getCount) =>
	`
		<div class='container-site'>
			<h2>Results for ${strsiteName}</h2>
			<h3>${getCount()} Pages Scraped</h3>
			<ul class='flex'>
				${arrAnchors.map((strAnchor) => `<li>${strAnchor}</li>`).join('')}
			</ul>
		</div>
	`;

const createEmptyDiv = (strsiteName, getCount) =>
	`
		<div class='container-site'>
			<h2>Results for ${strsiteName}</h2>
			<h3>${getCount()} Pages Scraped</h3>
			<p>No results with provided keywords.</p>
		</div>
	`;

export default createHtml;
