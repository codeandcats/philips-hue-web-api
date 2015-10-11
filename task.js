var wrapper = require('./wrapper');

var args = process.argv.slice(2);

switch (args[0]) {
	case 'config':
		showConfig();
		break;
	
	case 'bridges':
		listRegisteredBridges();
		break;
		
	case 'lights':
		listLights();
		break;
		
	case 'search':
		searchForBridges();
		break;
		
	case 'register':
		registerBridge(args[1]);
		break;
		
	case 'unregister':
		unregisterBridge(args[1]);
		break;
	
	default:
		console.log('Nope! Correct usage:');
		console.log('');
		console.log('\tbridges                 Lists registered bridges');
		console.log('\tsearch                  Searches for bridges');
		console.log('\tregister <bridge ip>    Register a bridge');
		console.log('\tunregister <bridge ip>  Unregister a bridge');
		console.log('\tlights                  Lists lights of registered bridges');
		break;
}

function logError(msg, err) {
	var message;
	
	if (err == undefined) {
		err = msg;
		msg = 'Error: ';
	}
	else {
		msg += ': ';
	}
	
	console.error(msg, (err && err.message) || err.message);
}

function showConfig() {
	wrapper.getConfig(function(err, config) {
		if (err) {
			logError(err);
		}
		else {
			console.log('Config: ', config);
		}
	});
}

function searchForBridges() {
	wrapper.searchForBridges(function(err, bridges) {
		if (err) {
			logError('Search failed', err);
		}
		else if (bridges && bridges.length) {
			console.log('Found bridges: ', bridges);
		}
		else {
			console.log('No bridges found');
		}
	});
}

function listRegisteredBridges() {
	wrapper.getBridges(function(err, bridges) {
		if (err) {
			logError('Error listing bridges', err);
		}
		else {
			console.log('Bridges: ', bridges);
		}
	});
}

function registerBridge(ipAddress) {
	wrapper.registerBridge(ipAddress, function(err) {
		if (err) {
			logError('Failed to register bridge', err);
		}
		else {
			console.log('Registered Bridge');
		}
	});
}

function unregisterBridge(ipAddress) {
	wrapper.unregisterBridge(ipAddress, function(err) {
		if (err) {
			logError('Error unregistering bridge', err);
		}
		else {
			console.log('Unregistered Bridge');
		}
	});
}

function listLights() {
	wrapper.getLights(function(err, bridges) {
		if (err) {
			logError('Error getting lights', err);
		}
		else {
			bridges.forEach(function(bridge) {
				console.log('Bridge ' + bridge.ipAddress + ' lights:', bridge.lights);
				console.log('');
			});
		}
	});
}



