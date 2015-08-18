var express = require('express');
var request = require('request');
var _ = require('lodash');
var app = express();
var PORT = process.env.PORT  || 9001;
var REFRESH_RATE = 60 * 60 * 1000; // Once every 60 minutes

app.use(express.static(__dirname));

app.listen(PORT, function () {
	console.log('Server started on port ' + PORT);
});

app.get('/data/world/', function (req, res) {
	res.json(worldCounter.count);
});

app.get('/data/sf/', function (req, res) {
	res.json(sfCounter.count);
});

function earthquakeCounter(options, refreshTime) {
	var me = {
		count: {},
		load: function () {
			var now = new Date();
			var startOfMonth = now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-01';
			var tomorrow = now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-' + bufferString(now.getDate() + 1, 2);
			var resOptions = {
				url: 'http://earthquake.usgs.gov/fdsnws/event/1/query',
				qs: _.extend(options, {
					format: 'geojson',
					starttime: startOfMonth,
					endtime: tomorrow
				}),
				json: true
			};

			request.get(resOptions, function (error, response, body) {
				me.count = handleEarthquakes(body);
				console.log(me.count);
			});
		}
	};

	function bufferString(string, length) {
		string = string.toString();

		if (string.length < length) {
			return bufferString('0' + string, length);
		}
		else {
			return string;
		}
	}

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

	me.load();
	setInterval(function () {
		me.load();
	}, refreshTime);

	return me;
}

var worldCounter = earthquakeCounter({}, REFRESH_RATE);

var sfOptions = {
	latitude: 37.7833,
	longitude: -122.4167,
	maxradiuskm: 100
};
var sfCounter = earthquakeCounter(sfOptions, REFRESH_RATE);