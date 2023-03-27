// Brume send route

/*function sendRandomData(sendFunc) {
	return new Promise(res => {
		setTimeout(() => {
			sendFunc({
				ConnectionId: global.connectionId,
				Data: `Random data from backend: ${Math.random().toString(36).slice(2,11)}`
			});
			res();
		}, Math.ceil(Math.random() * 5) * 1000);
	});
}

exports.handler = async (event, context) => {
	while(true) {
		await sendRandomData(context.clientContext.postToConnection);
	}
	return { statusCode: 200, body: 'success' };
};*/

function delay(seconds) {
	return new Promise(res => {
		setTimeout(() => { res(); }, seconds);
	});
}

exports.handler = async (event, context) => {
	let e = event;
	let keepGoing = true;
	while(keepGoing) {
		try {
			// getConnection isn't needed as postTo will reject if connection is closed
			// but it shows how to use getConnection, which returns information about the existing
			// ws connction or throws an error if the connection does not exist.
			await context.clientContext.getConnection({ConnectionId: global.connectionId});
			await context.clientContext.postToConnection({
				ConnectionId: global.connectionId,
				Data: Math.random().toString(36).slice(2,11)
			});
			await delay(Math.ceil(Math.random() * 5) * 1000);
		} catch(e) {
			keepGoing = false;
		}
	}
	return { statusCode: 200, body: 'success' };
};
