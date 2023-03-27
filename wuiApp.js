#!/usr/bin/env node

// License: Creative Commons Attribution-NonCommercial 4.0 International

'use strict';

const { join } = require('path'),
	server = require('./server/server.js'),
	startBrowser = require('./browser/startBrowser.js');
	
let apis = {
	web: { filesPath: './web'},
	rest: {
		filesPath: join(__dirname, './restApi'),
		templateName: 'template.yaml'
	},
	ws: {
		filesPath: join(__dirname, './wsApi'),
		templateName: 'template.yaml'
	}
};

(async () => {
	try {
		const serverPort = await server(apis);
		const browser = await startBrowser(serverPort);
	} catch(e){
		console.error(e);
	}
})();
