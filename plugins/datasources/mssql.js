var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mssql = require('mssql');

// Read mssql.json
var config = (function() {
	return readConfigFile(path.join(__dirname, '..', '..', 'mssql.json'));
}());

function readConfigFile(filePath) {
	try {
		var str = fs.readFileSync(filePath, { encoding: 'utf8'} );
		return JSON.parse(str);
	} catch {
		return {};
	}	
}

function readLocalConfigs(dir) {
	// Read config files from this dir and two levels up
	var config = {};
	var splitDir = path.normalize(dir).split('/');

	for (var i = 0; i < 2; ++i) {
		dir = path.join.apply(path, _.dropRight(splitDir, i));

	}
	
	for (var i = 0; i < 2; ++i, dir = dir.match(/(.*?)\/[^\/]+\/?$/)[1]) {

	}
}

function readMssql(datasource, cb) {
	if (datasource.type != "mssql") {
		var err = "datasource.type must be 'mssql'";
		
		if (callback) {
			callback(err);
			return;
		} else {
			throw err;
		}
	}

	var config = {};



	var connConfig = datasource.connectionConfig;
	if (_.isString(connConfig)) {
		if (!config.connectionConfigs[connConfig]) {
			cb('Named connection configuration not found: ' + connConfig);
			return;
		}

		connConfig = config.connectionConfigs[connConfig];
	}


}

module.exports = readMssql;