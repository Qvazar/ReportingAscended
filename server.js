var express = require('express');
var consolidate = require('consolidate');
var lazy = require('lazy.js');
var path = require('path');
var moment = require('moment');

//// BEGIN Load config with defaults
var config = require('./config.json');
var defaults = {
	"port": 3000,
	"reportsPath": "./examples/",
	"reportsExtension": "jade",
	"templateEngine": "jade"
};

config = lazy(config).defaults(defaults).toObject();

// Use PORT from iisnode if it exists
config.port = process.env.PORT || config.port;

//// END Load config with defaults

var renderTemplate = consolidate[config.templateEngine];

if (!renderTemplate) {
	console.error('Unknown template engine: %s.', config.templateEngine);
	return;
}

var app = express();

app.engine(config.reportsExtension, renderTemplate);
app.set('view engine', config.reportsExtension);
app.set('views', path.join(__dirname, config.reportsPath));

// TODO Setup security middleware

app.get('/reports/:reportName', function(req, res) {
	var reportName = req.params.reportName;
	var locals = {
		globals: {
			reportName: reportName,
			time: {
				now: moment()
			}
		},
		params: req.query
	};

	res.render(reportName, locals);
});

var server = app.listen(config.port, function() {
	var host = server.address().address,
		port = server.address().port;

		console.log('RA listening at http://%s:%s.', host, port);
});