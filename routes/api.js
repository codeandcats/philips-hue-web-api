var express = require('express');
var router = express.Router();
var wrapper = require('../wrapper');
var linq = require('linq');

/*

- Search for hue networks

/api/bridges
/api/bridges/<id>
/api/bridges/<id>/connect
/api/

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
router.get('/bridges/:id/connect', function(req, res, next) {
	wrapper.registerBridge(req.params.id, function(err) {
		if (err) {
			handleError(res, err);
		}
		else {
			res.status(201).json('Connected to bridge');
		}
	});
});

// List bridges
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
router.get('/lights/:ip(\d+\.\d+\.\d+\.\d+)/:id', function(req, res, next) {
	wrapper.getLights(function(err, bridges) {
		if (err) {
			handleError(res, err);
		}
		else {
			
			res.json(bridges);
		}
	});
});

// Update lights


module.exports = router;
