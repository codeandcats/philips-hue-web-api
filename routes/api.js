var express = require('express');
var router = express.Router();
var wrapper = require('../wrapper');
var linq = require('linq');

/*

- Search for hue networks

/api/bridges
/api/bridges/<ip>
/api/bridges/<ip>/connect
/api/lights/<ip>/<id>

*/

// Hello world
router.get('/', function(req, res, next) {
	res.json({
		message: 'hello world'
	});
});

function handleError(res, err, errCode) {
	errCode = errCode || 500;
	res.send(errCode, (err && err.message) || err);
}

// Connect to bridge
router.get('/bridges/:ip/connect', function(req, res, next) {
	wrapper.registerBridge(req.params.ip, function(err) {
		if (err) {
			handleError(res, err);
		}
		else {
			res.status(201).json('Connected to bridge');
		}
	});
});

// List Bridges
router.get('/bridges', function(req, res, next) {
	wrapper.getBridges(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			res.json(bridges);
		}
	});
});

// Get Bridge
router.get('/bridges/:ip', function(req, res, next) {
	wrapper.getBridges(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			var bridge = linq
				.from(bridges)
				.firstOrDefault(function(bridge) {
					return bridge.ipAddress == req.params.ip; 
				});
			
			res.json(bridge);
		}
	});
});

// Search for bridges
router.get('/bridges/search', function(req, res, next) {
	wrapper.searchForBridges(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			res.json(bridges);
		}
	});
});

// List of lights
router.get('/lights', function(req, res, next) {
	wrapper.getLights(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			res.json(bridges);
		}
	});
});

// Get light by bridge ip & light id
router.get('/lights/:ip/:id', function(req, res) {
	function notFound() {
		res.status(404).json('Light not found');
	}
	
	if (!req.params.ip || !req.params.id) {
		notFound();
		return;
	}
	
	wrapper.getLights(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			var bridge = linq
				.from(bridges)
				.firstOrDefault(function(bridge) {
					return bridge.ipAddress == req.params.ip; 
				});
			
			var light = linq
				.from(bridge.lights)
				.firstOrDefault(function(light) {
					return light.id == req.params.id;
				});
			
			if (!light) {
				notFound();
			}
			else {
				res.json(light);
			}
		}
	});
});

// Get Light by Light Id alone (will 404 if more than one bridge with same light id)
router.get('/lights/:id', function(req, res) {
	function notFound() {
		return res.status(404).json('Light not found');
	}
	
	if (!req.params.id) {
		return notFound();
	}
	
	wrapper.getLights(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			var matchingLights = linq
				.from(bridges)
				.selectMany(function(bridge) {
					return bridge.lights;
				})
				.where(function(light) {
					return light.id == req.params.id;
				})
				.toArray();
			
			if (!matchingLights || !matchingLights.length) {
				return notFound();
			}
			
			if (matchingLights.length > 1) {
				return res.status(404).json('Light not found - multiple matches');
			}
			
			res.json(matchingLights[0]);
		}
	});
});

// Update lights
router.put('/lights/:id', function(req, res) {
	
	function notFound() {
		return res.status(404).json('Light not found');
	}
	
	if (!req.params.id) {
		return notFound();
	}
	
	wrapper.getLights(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			var foundLight = false;
			
			bridges.forEach(function(bridge) {
				
				if (!foundLight) {
					var light = linq
						.from(bridge.lights)
						.firstOrDefault(function(l) {
							return l.id == req.params.id
						});
					
					if (light) {
						foundLight = true;
						
						var lightToUpdate = {
							ipAddress: bridge.ipAddress,
							id: light.id	
						};
						
						var state = {};
						for (var name in req.body) {
							state[name] = req.body[name];
						}
						
						console.log('Wrapper about to set light state', lightToUpdate, state);
						
						wrapper.setLightState(lightToUpdate, state, function(err, state) {
							if (err) {
								res.status(500).json(err && err.message);
							}
							else {
								res.status(200).json('Light updated.');
							}
						});
					}
				}
			});
			
			
		}
	});
	
});

module.exports = router;
