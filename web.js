var express = require('express');
var request = require('request');
var _ = require('lodash');
var app = express();
var PORT = process.env.PORT  || 9001;

function bufferString(string, length) {
	string = string.toString();

	if (string.length < length) {
		return bufferString('0' + string, length);
	}
	else {
		return string;
	}
}

app.use(express.static(__dirname));

app.listen(PORT, function () {
	console.log('Server started on port ' + PORT);
});

function handleEarthquakes(earthquakes) {
	var dict = {};

	_.forEach(earthquakes.features, function (earthquake) {
		var mag = Math.round(earthquake.properties.mag);

		if (!dict[mag]) {
			dict[mag] = {
				count: 0
			};
		}

		dict[mag].count++;
	});

	dict.totalCount = earthquakes.metadata.count;
	
	return dict;
}

app.get('/data/world/', function (req, res) {
	var now = new Date();
	var startOfMonth = now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-01';
	var tomorrow = now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-' + bufferString(now.getDate() + 1, 2);
	var options = {
		url: 'http://earthquake.usgs.gov/fdsnws/event/1/query',
		qs: {
			format: 'geojson',
			starttime: startOfMonth,
			endtime: tomorrow
		},
		json: true
	};

	request.get(options, function (error, response, body) {
		res.json(handleEarthquakes(body));
	});
});

app.get('/data/sf/', function (req, res) {
	var now = new Date();
	var startOfMonth = now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-01';
	var tomorrow = now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-' + bufferString(now.getDate() + 1, 2);
	var options = {
		url: 'http://earthquake.usgs.gov/fdsnws/event/1/query',
		qs: {
			format: 'geojson',
			starttime: startOfMonth,
			endtime: tomorrow,
			latitude: 37.7833,
			longitude: -122.4167,
			maxradiuskm: 100
		},
		json: true
	};

	request.get(options, function (error, response, body) {
		res.json(handleEarthquakes(body));
	});
});