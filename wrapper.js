(function(module) {

	// Dependencies
	var hue = require('node-hue-api');
	var fs = require('fs');
	var linq = require('linq');

	// TODO: When registering bridge, suffix username with random chars

	var userName = 'webapiuser';
	var userDescription = 'Web Api User';

	function getConfigFileName() {
		return __dirname + '/config.json';
	}

	function getConfig(done) {
	
		var fileName = getConfigFileName();
		
		fs.stat(fileName, function(err, stat) {
			var blankConfig = {
				bridges: []
			};
			
			if (!stat || !stat.isFile || !stat.isFile()) {
				return done(null, blankConfig);
			}
			
			fs.readFile(fileName, 'utf8', function(err, json) {
				if (err) {
					return done(err);
				}
				
				if (!json) {
					return done(null, blankConfig);
				}
				
				try {
					var config = JSON.parse(json);
				}
				catch (error) {
					return done(error);
				}
				
				return done(err, config);
			});
			
		});
	}

	function setConfig(config, done) {
		var options = { encoding: 'utf8' };
		var data = JSON.stringify(config);
		fs.writeFile(getConfigFileName(), data, options, done);
	}

	function searchForBridges(done) {
		hue
			.nupnpSearch()
			.then(function(bridges) {
				done(null, bridges);
			})
			.fail(function(err) {
				done(err);
			});
	}
	
	function getBridges(done) {
		getConfig(function(err, config) {
			if (err) {
				done(err);
			}
			else {
				var infoCount = 0;
				
				config.bridges.forEach(function(bridge) {
					// Connect to bridge
					var api = new hue.HueApi(bridge.ipAddress, bridge.userId);
					
					// Get info about bridge
					api.config().then(function(info) {
						for (var p in info) {
							bridge[p] = info[p];
						}
						
						infoCount++;
						if (infoCount == config.bridges.length) {
							done(null, config.bridges);
						}
					});
				});
			}
		});
	}
	
	function registerBridge(ipAddress, done) {
		getConfig(function(err, config) {
			var api = new hue.HueApi();
			
			// Register user with hue bridge
			api
				.registerUser(ipAddress, userName, userDescription)
				.then(function(userId) {
					
					// Add the bridge to our config
					config.bridges.push({
						ipAddress: ipAddress,
						userId: userId
					});
					
					// Save our config file
					setConfig(config, function() {
						done(null);
					});
					
				})
				.fail(function(err) {
					done(err);
				});
		});
	}
	
	function unregisterBridge(ipAddress, done) {
		getConfig(function(err, config) {
			// Get the bridge from our config file
			var bridge = linq
				.from(config.bridges)
				.single(function(bridge) {
					return bridge.ipAddress == ipAddress;
				});
				
			// Connect to the bridge
			var api = new hue.HueApi(bridge.ipAddress, bridge.userId);
			
			// Remove our user from the hue bridge
			api
				.deleteUser(bridge.userId)
				.then(function() {
					
					// Remove the bridge from the list of registered bridges
					config.bridges = linq
						.from(config.bridges)
						.where(function(bridge) {
							return bridge.ipAddress != ipAddress;
						})
						.toArray();
					
					// Save the config file
					setConfig(config, function() {
						done(null);
					});
					
				})
				.fail(function(err) {
					done(err);
				});
		});
	}
	
	function getLights(done) {
		getConfig(function(err, config) {
			if (err) {
				done(err);
			}
			else {
				var bridgeCount = 0;
				
				var allLights = [];
				
				function checkDone() {
					if (bridgeCount == config.bridges.length) {
						done(null, allLights);
					}
				}
				
				config.bridges.forEach(function(bridge) {
					// Connect to bridge
					var api = new hue.HueApi(bridge.ipAddress, bridge.userId);
					
					// Get lights connected to bridge
					api.lights().then(function(info) {
						var statusCount = 0;
						info.ipAddress = bridge.ipAddress;
						
						info.lights.forEach(function(light) {
							api.lightStatus(light.id, function(err, status) {
								statusCount++;
								for (var p in status) {
									light[p] = status[p];
								}
								if (statusCount == info.lights.length) {
									bridgeCount++;
									allLights.push(info);
									checkDone();
								}
							});
						});
					})
					.fail(function(err) {
						bridgeCount++;
						checkDone();
					});
				});
			}
		});
	}
	
	module.exports.getConfig = getConfig;
	module.exports.setConfig = setConfig;
	module.exports.searchForBridges = searchForBridges;
	module.exports.getBridges = getBridges;
	module.exports.registerBridge = registerBridge;
	module.exports.unregisterBridge = unregisterBridge;
	module.exports.getLights = getLights;
	
	
})(module);

