function readStatic(datasource, callback) {
	if (datasource.type != "static") {
		var err = "datasource.type must be 'static'";
		
		if (callback) {
			callback(err);
			return;
		} else {
			throw err;
		}
	}

	var data = datasource.data;
	if (callback) {
		callback(null, data);
	} else {
		return data;
	}
}

module.exports = readStatic;