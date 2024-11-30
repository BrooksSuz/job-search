function createHtmlListings(siteListings) {
	const htmlListings = siteListings
		.map((objListings) => {
			const [[name, arrConfigObjects]] = Object.entries(objListings);
			if (arrConfigObjects) {
				const anchors = arrConfigObjects.map((listing) =>
					createAnchor(listing)
				);
				return createDiv(name, anchors);
			}
		})
		.join('');
	return htmlListings;
}

const createAnchor = (listing) => {
	const [[title, url]] = Object.entries(listing);
	if (listing) return `<a href='${url}' target='_blank'>${title}</a>`;
};

const createDiv = (name, arrAnchors) => `
	<div class='container-org'>
		<h2>Results for ${name}:</h2>
		<ul>
			${arrAnchors.map((anchor) => `<li>${anchor}</li>`).join('')}
		</ul>
	</div>
`;

export default createHtmlListings;
