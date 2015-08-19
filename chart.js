var data = [];
var worldGraph = {
	balloonText: 'Number of earthquakes with approximate magnitude [[category]] in [[title]]:[[value]]',
	fillAlphas: 0.7,
	fillColorsField: 'worldColor',
	lineColorField: 'worldColor',
	title: 'World',
	type: 'column',
	valueField: 'worldCount',
	hidden: false,
};
var sfGraph = {
	balloonText: 'Number of earthquakes with approximate magnitude [[category]] in [[title]]:[[value]]',
	fillAlphas: 0.7,
	fillColorsField: 'sfColor',
	lineColorField: 'sfColor',
	title: 'San Francisco',
	type: 'column',
	valueField: 'sfCount',
	hidden: true
};

var chart = window.AmCharts.makeChart('chartDiv',
	{
		type: 'serial',
		categoryField: 'name',
		startDuration: 1,
		categoryAxis: {
			gridPosition: 'start',
			title: 'Magnitude'
		},
		trendLines: [],
		graphs: [
			worldGraph,
			sfGraph
		],
		guides: [],
		valueAxes: [
			{
				stackType: 'regular',
				title: 'Count'
			}
		],
		allLabels: [],
		balloon: {},
		titles: [
			{
				size: 15,
				text: 'Number of Earthquakes'
			}
		],
		export: {
			enabled: true,
			libs: {
				path: 'http://amcharts.com/lib/3/plugins/export/libs/'
			}
		},
		dataProvider: data
	}
);

function getColor(count, total) {
	var percentage = count / total;

	if (percentage > 0.5) {
		return '#00FF00';
	}
	else if (percentage > 0.4) {
		return '#00CC00';
	}
	else if (percentage > 0.3) {
		return '#CCCC00';
	}
	else if (percentage > 0.2) {
		return '#CC9900';
	}
	else {
		return '#FF0000';
	}
}

function sortData(col1, col2) {
	if (col1.name < col2.name) {
		return -1;
	}
	else if (col1.name > col2.name) {
		return 1;
	}
	else {
		return 0;
	}
}

var socket = io();
socket.on('world', function (res) {
	_.forEach(res, function (value, key) {
		var mag = Number(key);
		if (_.isNaN(mag)) {
			return;
		}

		var col = _.find(data, { name: mag });

		if (!col) {
			col = {
				name: mag,
				worldCount: 0,
				sfCount: 0
			};
			data.push(col);
		}

		col.worldCount = value;
		col.worldColor = getColor(col.worldCount, res.totalCount);
	});

	data.sort(sortData);
	chart.validateData();
});
socket.on('sf', function (res) {
	_.forEach(res, function (value, key) {
		var mag = Number(key);
		if (_.isNaN(mag)) {
			return;
		}

		var col = _.find(data, { name: mag });

		if (!col) {
			col = {
				name: mag,
				worldCount: 0,
				sfCount: 0
			};
			data.push(col);
		}

		col.sfCount = value;
		col.sfColor = getColor(col.sfCount, res.totalCount);
	});

	data.sort(sortData);
	chart.validateData();
});

$(function () {
	$('button#worldButton').click(function () {
		worldGraph.hidden = false;
		sfGraph.hidden = true;
		$('div.btn-group button').removeClass('active');
		$(this).addClass('active');

		chart.validateData();
	});

	$('button#sfButton').click(function () {
		worldGraph.hidden = true;
		sfGraph.hidden = false;
		$('div.btn-group button').removeClass('active');
		$(this).addClass('active');

		chart.validateData();
	});
});
