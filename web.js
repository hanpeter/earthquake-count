(function () {
	var express = require('express');
	var earthquakeCounter = require('./EarthquakeCounter.js');

	var app = express();
	var PORT = process.env.PORT  || 9001;

	app.use(express.static(__dirname));

	var io = require('socket.io').listen(app.listen(PORT, function () {
		console.log('Server started on port ' + PORT);
	}));

	io.sockets.on('connection', function (socket) {
		socket.emit('world', worldCounter.count);
		socket.emit('sf', sfCounter.count);
	});

	app.get('/data/world/', function (req, res) {
		res.json(worldCounter.count);
	});

	app.get('/data/sf/', function (req, res) {
		res.json(sfCounter.count);
	});

	var worldCounter = earthquakeCounter({
		afterLoad: function () {
			io.sockets.emit('world', worldCounter.count);
		}
	});

	var sfCounter = earthquakeCounter({
		latitude: 37.7833,
		longitude: -122.4167,
		maxradiuskm: 100,
		afterLoad: function () {
			io.sockets.emit('sf', sfCounter.count);
		}
	});
})();