(function() {
	
	var wrapper = require('./wrapper');
	var linq = require('linq');

	var args = process.argv.slice(2);
	
	var commandName = args[0];
	
	args = args.slice(1);
	
	switch (commandName) {
		case 'config':
			showConfig();
			break;
		
		case 'bridges':
			listRegisteredBridges();
			break;
			
		case 'lights':
			listLights();
			break;
			
		case 'light':
			var lightId = args[0];
			args.shift();
			
			if (args.length > 0) {
				updateLight(lightId, args);
			}
			else {
				showLight(lightId);
			}
			break;
			
		case 'search':
			searchForBridges();
			break;
			
		case 'register':
			registerBridge(args[0]);
			break;
			
		case 'unregister':
			unregisterBridge(args[0]);
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
	
	function showLight(lightId) {
		wrapper.getLights(function(err, bridges) {
			if (err) {
				logError('Error getting light', err);
			}
			else {
				var matchingLights = linq
					.from(bridges)
					.selectMany(function(b) {
						return b.lights;
					})
					.where(function(l) {
						return l.id == lightId;
					})
					.toArray();
				
				if (matchingLights.length > 1) {
					console.log('Multiple Lights matching Id: ', lightId);
					console.log('');
				}
				
				matchingLights.forEach(function(light) {
					console.log('Light: ', light);
					console.log('');
				});
			}
		});
	}
	
	function updateLight(lightId, args) {
		wrapper.getLights(function(err, bridges) {
			if (err) {
				logError('Error getting light', err);
			}
			else {
				var matchingLights = linq
					.from(bridges)
					.selectMany(function(b) {
						return b.lights;
					})
					.where(function(l) {
						return l.id == lightId;
					})
					.toArray();
				
				if (matchingLights.length > 1) {
					console.log('Multiple Lights matching Id: ', lightId);
					console.log('');
				}
				else {
					var light = matchingLights[0];
					
					if (!light) {
						console.log('Light not found');
						console.log('');
					}
					else {
						console.log('Light found. Building state...');
						
						var state = {};
						while (args.length > 0) {
							var name = args.shift();
							var value = args.length > 0 ? args.shift() : null;
							
							if (value != null) {
								state[name] = value;
								
								switch (name.toLowerCase()) {
									case 'on':
										if (('' + value).toLowerCase() == 'true' || value == '1') {
											value = true;
										}
										else {
											value = false;
										}
										state[name] = value;
										break;
									
									case 'hue':
									case 'brightness':
									case 'saturation':
										state[name] = parseInt(value);
										break;
								}
							}
						}
						
						console.log('Updating state: ', state);
						
						wrapper.setLightState({ id: lightId }, state);
					}
				}
			}
		});
	}
	
})();