'use strict';

// License: Creative Commons Attribution-NonCommercial 4.0 International

const { spawn } = require('node:child_process'),
	{ cpSync, rmSync, } = require('fs'),
	{ tmpdir } = require('os'),
	findBrowser = require('./findBrowser.js');

const appDomain = 'http://127.0.0.1';

const firefoxProfile = './firefoxProfile',
	firefoxData = `${tmpdir()}/firefoxData-${Math.random().toString(36).slice(2,11)}`;

async function startBrowser(port) {
	let browser = null;

	try {
		let {browserName, browserPath} = await findBrowser();
		const appUrl = `${appDomain}:${port}`;
		const args = {
			chrome: [
				'--new-window',
				//`--user-data-dir=${chromeData}`,
				//'--window-size=800,600',
				`--app=${appUrl}`
			],

			firefox: [
				//'-window-size',
				//'1200,900',
				'-profile',
				`${firefoxData}`,
				'-new-window',
				`${appUrl}`,
				'-new-instance',
				'-no-remote'
			]
		};

		if(browserName == 'firefox') {
			cpSync(firefoxProfile, firefoxData, {recursive: true});
		}
		browser = spawn(browserPath, args[browserName == 'firefox' ? 'firefox' : 'chrome']);
		
		global.wuiBrowser = () => { // Called by REST API server when browser app POSTs /ctrl/pageclose
			browser.kill();
			if(browserName == 'firefox')rmSync(firefoxData, { recursive: true, force: true });
			process.exit(0);
		};

		return browser;
	}catch(e) {
		console.error(e);
	}
}

module.exports = startBrowser;
