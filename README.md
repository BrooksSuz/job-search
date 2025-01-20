# Job Search: A Web Scraping Application

## Overview

This project began as a way to simplify the job search process and make it more accessible. The result is a web application that uses Puppeteer, a powerful JavaScript library, to scrape job listings from career pages.

Initially designed to support the University of Michigan's career page, the application has since evolved to allow users to input their own CSS selectors and scrape any website of their choice. This flexibility opens up a world of possibilities for job seekers.

Built on Node.js with MongoDB integration, the application provides user account functionality, ensuring scraper configurations are securely stored and easily managed.

---

## Disclaimer

This project requires proper website configurations and a fully functional website to operate correctly. Please ensure you comply with the terms of service of any website you use this tool on. If unsure about the terms, contact the webmaster or IT team to confirm compliance.

---

## Features

### Keyword Search

Users can input keywords and click "Get Jobs" to retrieve matching listings.

### Advanced Settings

Now live! Users can customize the scraper by entering CSS selectors for any website they wish to target. This feature requires account creation. I discuss each input below.

### Premade Configurations

Preconfigured support is available for:

- Bowling Green State University
- Eastern Michigan
- University of Michigan

To select multiple configurations, hold the "control" key and click as many configurations as you like. Control + click also deselects a configuration.

### User Accounts

Account creation enables personalized configurations and advanced feature access.

### Enhanced UI/UX

A full-fledged interface ensures a clean, intuitive experience for all users.

---

## Roadmap

### Data Persistence

Saved job listings will soon be supported in MongoDB, complementing existing configuration storage.

### Email Notifications

Integration with Nodemailer is underway to provide updates when new listings match user criteria.

### Code Cleanup

I've tried my best to keep the codebase clean along the way. That being said...I am far from perfect. I am actively cleaning up the codebase.

---

## Advanced Settings Guide

To scrape websites, Puppeteer requires HTML elements to interact with. This is done via CSS selectors. I'll discuss each input briefly:

### Site Name

The name of the configuration. The name itself doesn't matter.

That being said, it's the only required input. This is to make interacting and sorting configurations easier.

### URL

The exact URL of the website to be scraped. This should be the first page of the website. If no URL is provided, the tool will not work.

### Selector (1): Consent Popup

The first CSS selector checks the site for a consent popup.

The tool is looking for a clickable element. For example, a button: button#consent_agree.

### Selector (2): Listings

The second CSS selector checks for all the listings that contain at least one of the provided keywords (if no keywords, it will return all listings).

The tool is looking for a clickable element. For example, an anchor: h3.card-title > a#link_job_title.

### Selector (3): Next Page Disabled

The third selector checks if the "next page" (or "next page" equivalent) element is disabled.

This can be the HTML attribute disabled (in which case, simply type: disabled) or a custom CSS class such as: element-disabled.

### Selector (4): Next Page Element

The fourth selector checks for the "next page" (or "next page" equivalent) element.

The tool is looking for a clickable element. For example, an anchor: li.next_page > a.

### Selector (5): Parent Element of Next Page

The fifth selector checks for a parent element of the "next page" (or "next page" equivalent). Most of the time, this selector should be left empty. It's only provided for websites that are a bit finicky with their HTML.

Only use this input if the current configuration isn't working.

The tool is looking for any kind of container element. Likely, it will be the div element. For example: li.PagedList-skipToNext:has(> a[aria-label="Go to Next Page"]).

### Error(s): End of Scraping

This input is to tell Puppeteer when it needs to stop. Puppeteer can't predict where the site ends at. It will throw an error when it is unable to find the "next page" (or "next page" equivalent) element.

When the provided error(s) occur, the tool will assume the website has reached the final page and will conclude the scraping.

It is recommended to fill this input with the following:

> Waiting for selector, Failed to execute, Node is detached, Execution context was destroyed, Session closed. Most likely the page has been closed., Node is either not clickable or not an Element.

### Anchor Tag Checkbox

Check this box if the "next page" element is an anchor tag. Otherwise, leave the box unchecked.

### Final Steps

Once all of the required inputs are filled out, simply:

1. Click the "Add" button.
2. Select the configuration.
3. Click the "Get Jobs" button to run the tool!

---

## Why This Project?

Job searching is often time-consuming and overwhelming. This application was designed to streamline the process, making it easier for users to focus on finding the right opportunities. While still a work in progress, the project emphasizes scalability, usability, and adaptability.

Whether you're actively seeking a job or simply exploring the possibilities of web scraping, I hope this tool proves valuable!
