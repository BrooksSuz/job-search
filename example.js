import * as cheerio from 'cheerio';
import axios from 'axios';

const url = 'https://www.utoledo.edu/policies';

axios
	.get(url)
	.then((res) => {
		const html = res.data;
		const $ = cheerio.load(html);
		const firstH1 = $('h1').first().html();
		console.log(firstH1);
	})
	.catch((err) => {
		console.error('Error fetching the webpage', err);
	});
