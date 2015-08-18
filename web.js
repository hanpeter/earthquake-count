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

function earthquakeCounter(options) {
	var me = {
		count: {},
		load: function () {
			var resOptions = {
				url: 'http://earthquake.usgs.gov/fdsnws/event/1/query',
				qs: _.extend({
					format: 'geojson',
					starttime: me.startTime,
					endtime: me.endTime
				}, options),
				json: true
			};

			request.get(resOptions, function (error, response, body) {
				me.count = handleEarthquakes(body);
				me.afterLoad();
				console.log(me.count);
			});
		},
		afterLoad: options.afterLoad || function () {}
	};

	Object.defineProperties(me, {
		startTime: {
			enumerate: true,
			get: function () {
				var now = new Date();
				return now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-01';
			}
		},
		endTime: {
			enumerate: true,
			get: function () {
				var now = new Date();
				return now.getFullYear() + '-' + bufferString(now.getMonth() + 1, 2) + '-' + bufferString(now.getDate() + 1, 2);
			}
		}
	});

	var refreshTime = options.refreshTime || REFRESH_RATE;

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

var worldCounter = earthquakeCounter({
	afterLoad: function () {

	}
});

var sfOptions = {
	latitude: 37.7833,
	longitude: -122.4167,
	maxradiuskm: 100,
	afterLoad: function () {

	}
};
var sfCounter = earthquakeCounter(sfOptions);