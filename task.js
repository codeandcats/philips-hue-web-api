var wrapper = require('./wrapper');

var args = process.argv.slice(2);

switch (args[0]) {
	case 'config':
		showConfig();
		break;
	
	case 'list':
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
		console.log('\tlist                  Lists registered bridges');
		console.log('\tlights                Lists lights of registered bridges');
		console.log('\tsearch                Searches for bridges');
		console.log('\tregister <bridge ip>  Register a bridge');
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
			console.error('Search failed: ', err);
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
			logError(err);
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
			console.error('Error unregistering bridge: ', err);
		}
		else {
			console.log('Unregistered Bridge');
		}
	});
}

function listLights() {
	wrapper.getLights(function(err, lights) {
		if (err) {
			console.error('Error getting lights: ', err);
		}
		else {
			console.log('Lights: ', lights);
		}
	});
}



