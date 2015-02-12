var express = require('express');
var consolidate = require('consolidate');
//var lazy = require('lazy.js');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var async = require('async');
var moment = require('moment');

var config = (function loadConfig() {
	var config = require('./config.json');
	var defaults = {
		"port": 3000,
		"reportsPath": "./examples/",
		"reportsExtension": "jade",
		"templateEngine": "jade",
		"pluginsPath": "./plugins"
	};

	config = _.defaults(config, defaults);

	// Use PORT from iisnode if it exists
	config.port = process.env.PORT || config.port;

	return config;
}());

function readDataForReport(report, cb) {
	function readDatasource(dsJson, cb) {
		var type = dsJson.type;

		// Require the datasource reader
		var reader = require(path.join(config.pluginsPath, 'datasources', type));
		reader(dsJson, cb);
	}

	var datasourcesPath = path.join(config.reportsPath, report.name, 'datasources');

	fs.readdir(datasourcesPath, function(err, fileNames) {
		fileNames = _.filter(fileNames, function(fn) { return /\.json$/.test(fn); });
		async.parallel(
			_.map(fileNames, function(fn) {
				return function(cb) {
					var dsPath = path.join(datasourcesPath, fn);
					var dsName = fn.match(/^(.*?)(?:\.[^\.]*)?$/)[1];
					var ds = require(dsPath);
					ds.path = dsPath;

					readDatasource(ds, function(err, data) {
						cb(err, (err ? undefined : {
							name: dsName,
							data: data
						}));
					});
				};
			}),
			cb);
	});
}

var renderTemplate = consolidate[config.templateEngine];

if (!renderTemplate) {
	console.error('Unknown template engine: %s.', config.templateEngine);
	return;
}

var app = express();

app.engine(config.reportsExtension, renderTemplate);
app.set('view engine', config.reportsExtension);
app.set('views', path.join(__dirname, config.reportsPath));

// TODO Setup security middleware here

app.get('/reports/:reportName', function(req, res) {
	var report = {
		name: req.params.reportName,
		data: {
			globals: {
				reportName: reportName,
				time: {
					now: moment()
				}
			},
			params: req.query
		}
	};

	// Read datasources for this report
	readDataForReport(report, function(err, datasources) {
		_.assign.bind(_, report.data).apply(datasources);

		res.render(path.join(report.name, 'view'), report.data);
	});
});

var server = app.listen(config.port, function() {
	var host = server.address().address,
		port = server.address().port;

		console.log('RA listening at http://%s:%s.', host, port);
});