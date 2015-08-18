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

var worldQuery = $.ajax({
	url: '/data/world/',
	method: 'GET',
	contentType: 'application/json'
});
var sfQuery = $.ajax({
	url: '/data/sf/',
	method: 'GET',
	contentType: 'application/json'
});

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

$.when(worldQuery, sfQuery)
	.done(function (worldRes, sfRes) {
		var dict = {};
		var world = worldRes[0];
		var sf = sfRes[0];
		var maxMag = Number.MIN_VALUE;
		var minMag = Number.MAX_VALUE;

		_.forEach(_.keys(world), function (mag) {
			mag = Number(mag);

			if (!_.isNaN(mag)) {
				maxMag = Math.max(maxMag, mag);
				minMag = Math.min(minMag, mag);
			}
		});

		_.forEach(_.keys(sf), function (mag) {
			mag = Number(mag);

			if (!_.isNaN(mag)) {
				maxMag = Math.max(maxMag, mag);
				minMag = Math.min(minMag, mag);
			}
		});

		for (var i = minMag; i <= maxMag; i++) {
			var col = {
				name: i,
				worldCount: (world[i] && world[i].count) || 0,
				sfCount: (sf[i] && sf[i].count) || 0
			};
			col.worldColor = getColor(col.worldCount, world.totalCount);
			col.sfColor = getColor(col.sfCount, sf.totalCount);

			data.push(col);
		}

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