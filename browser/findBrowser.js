const { exec } = require('node:child_process'),
	{ join } = require('path'),
	{ existsSync } = require('fs'),
	defaultBrowser = require('x-default-browser');

function which(name) {
	return new Promise((resolve, reject) => {
		let child = exec(`which ${name}`);
		child.stdout.on('data', data => { resolve(data.toString().slice(0,-1)); });
		child.stderr.on('data', data => {resolve(null); });
		child.on('exit', code => { resolve(null); });
	});
}

let browserPaths = ({ // taken from Gluon-framework
	win32: process.platform === 'win32' && { // windows paths are automatically prepended with program files, program files (x86), and local appdata if a string, see below
		chrome: [
			join('Google', 'Chrome', 'Application', 'chrome.exe'),
			join(process.env.USERPROFILE, 'scoop', 'apps', 'googlechrome', 'current', 'chrome.exe')
		],
		chrome_beta: join('Google', 'Chrome Beta', 'Application', 'chrome.exe'),
		chrome_dev: join('Google', 'Chrome Dev', 'Application', 'chrome.exe'),
		chrome_canary: join('Google', 'Chrome SxS', 'Application', 'chrome.exe'),

		chromium: [
			join('Chromium', 'Application', 'chrome.exe'),
			join(process.env.USERPROFILE, 'scoop', 'apps', 'chromium', 'current', 'chrome.exe')
		],

		edge: join('Microsoft', 'Edge', 'Application', 'msedge.exe'),
		edge_beta: join('Microsoft', 'Edge Beta', 'Application', 'msedge.exe'),
		edge_dev: join('Microsoft', 'Edge Dev', 'Application', 'msedge.exe'),
		edge_canary: join('Microsoft', 'Edge SxS', 'Application', 'msedge.exe'),

		thorium: join('Thorium', 'Application', 'thorium.exe'),
		brave: join('BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
		vivaldi: join('Vivaldi', 'Application', 'vivaldi.exe'),

		firefox: [
			join('Mozilla Firefox', 'firefox.exe'),
			join(process.env.USERPROFILE, 'scoop', 'apps', 'firefox', 'current', 'firefox.exe')
		],
		firefox_developer: join('Firefox Developer Edition', 'firefox.exe'),
		firefox_nightly: join('Firefox Nightly', 'firefox.exe'),

		librewolf: join('LibreWolf', 'librewolf.exe'),
		waterfox: join('Waterfox', 'waterfox.exe'),
	},

	linux: { // these should be in path so just use the name of the binary
		chrome: [ 'chrome', 'google-chrome', 'chrome-browser', 'google-chrome-stable' ],
		chrome_beta: [ 'chrome-beta', 'google-chrome-beta', 'chrome-beta-browser', 'chrome-browser-beta' ],
		chrome_dev: [ 'chrome-unstable', 'google-chrome-unstable', 'chrome-unstable-browser', 'chrome-browser-unstable' ],
		chrome_canary: [ 'chrome-canary', 'google-chrome-canary', 'chrome-canary-browser', 'chrome-browser-canary' ],

		chromium: [ 'chromium', 'chromium-browser' ],
		chromium_snapshot: [ 'chromium-snapshot', 'chromium-snapshot-bin' ],

		edge: [ 'microsoft-edge', 'microsoft-edge-stable', 'microsoft-edge-browser' ],
		edge_beta: [ 'microsoft-edge-beta', 'microsoft-edge-browser-beta', 'microsoft-edge-beta-browser' ],
		edge_dev: [ 'microsoft-edge-dev', 'microsoft-edge-browser-dev', 'microsoft-edge-dev-browser' ],
		edge_canary: [ 'microsoft-edge-canary', 'microsoft-edge-browser-canary', 'microsoft-edge-canary-browser' ],

		thorium: [ 'thorium', 'thorium-browser' ],
		brave: [ 'brave', 'brave-browser' ],
		vivaldi: [ 'vivaldi', 'vivaldi-browser' ],

		firefox: [ 'firefox', 'firefox-browser' ],
		firefox_nightly: [ 'firefox-nightly', 'firefox-nightly-browser', 'firefox-browser-nightly' ],

		librewolf: [ 'librewolf', 'librewolf-browser' ],
		waterfox: [ 'waterfox', 'waterfox-browser' ],
	},

	darwin: {
		chrome: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		chrome_beta: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome Beta',
		chrome_dev: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome Dev',
		chrome_canary: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',

		chromium: '/Applications/Chromium.app/Contents/MacOS/Chromium',

		edge: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
		edge_beta: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge Beta',
		edge_dev: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge Dev',
		edge_canary: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge Canary',

		thorium: '/Applications/Thorium.app/Contents/MacOS/Thorium',
		brave: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
		vivaldi: '/Applications/Vivaldi.app/Contents/MacOS/Vivaldi',

		firefox: '/Applications/Firefox.app/Contents/MacOS/firefox',
		firefox_nightly: '/Applications/Firefox Nightly.app/Contents/MacOS/firefox',

		librewolf: '/Applications/LibreWolf.app/Contents/MacOS/librewolf',
		waterfox: '/Applications/Waterfox.app/Contents/MacOS/waterfox',
	}
})[process.platform];

let browserName = null,
	browserPath = null;

function findBrowser(){
	return new Promise((resolve, reject) => {
		defaultBrowser(async (err, res) => {
			if(err) reject(err);
			for(const browser of Object.keys(browserPaths)) { // is default browser compatible?
				if(res.identity.includes(browser)) {
					browserName = browser;
					browserPath = browserPaths[browserName];
					break;
				}
			}

			switch(process.platform) {
				case 'darwin':
					if(!browserPath){ // if default not compatible, find an installed one that is
						for(const browser of Object.keys(browserPaths)){
							if(existsSync(browserPaths[browser])) {
								browserPath = browserPaths[browser];
								break;
							}
						}
					}
					break;
	
				case 'linux':
					for(const name of browserPath) { // Search for path to default
						let linuxPath = await which(name);
						if(linuxPath) {
							browserPath = linuxPath;
							break;
						}
					};

					// Either default not compatible or no path to default (strange)
					// See if a compatible one is installed

					break;
				
				case 'win32':
					reject('windows not supported');
					break;
	
				default:
					reject(`unknown process.platform: ${process.platform}`);
					break;
			}

			if(browserPath) {
				resolve({browserName, browserPath});
			} else {
				reject('no compatible browser for the user interface');
			}
		});
	});
}

module.exports = findBrowser;
