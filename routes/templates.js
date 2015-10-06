var express = require('express');
var router = express.Router();

// Partial Views
router.get('/templates/:templateName', function(req, res) {
	var path = 'templates/' + req.params.templateName;
	res.render(path);
});

module.exports = router;