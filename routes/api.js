var express = require('express');
var router = express.Router();
var hue = require('node-hue-api');

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

// Search for bridges
router.get('/bridges', function(req, res, next) {
	
	hue.nupnpSearch().then(function(bridges) {
		res.json(bridges);
	}).fail(function(err) {
		handleError(res, err);
	})
	
});

router.get('/bridges/:id/:userId', function(req, res, next) {
	
	var ipRegEx = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/,
		id = req.params.id,
		userId = req.params.userId,
		ipAddress = ipRegEx.test(id) ? id : null,
		api;
	
	if (ipAddress) {
		api = new hue.HueApi(ipAddress, userId);
		
		api.config().then(function(settings) {
			res.json(settings);
		}).fail(function(err) {
			handleError(res, err);
		});
	}
	else {
	}
	
});


module.exports = router;
