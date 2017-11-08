var debug = 1;

/* create svg */
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
	width = 960 - margin.left - margin.right,
	height = 640 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);
	g = svg.append('g')
		.attr('transform', 'translate(' + 
		margin.left + ',' + margin.top + ')');

/* parse file */
d3.text("IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.csv", function (error, data) {
	if(error){
		console.log(error);
		return;
	}

	/* process data */
	var csvData = d3.csvParse(data);

	var entries = d3.nest()
		.key(function(d) { return d.location_name; })
		.key(function(d) { return d.year; })
		.rollup(function(leaves){
			var result = d3.mean(leaves, function(d){ return d.mean; })
			return result;
		})
		.entries(csvData);

	if(debug) console.log(entries);

	var x = d3.scaleTime()
		.domain([new Date(1990, 0, 1, 0), new Date(2013, 0, 1, 0)])
		.range([0, width]);
		
	var y = d3.scaleLinear()
		.domain([0, 100])
		.range([height, 0]);

	var xAxis = d3.axisBottom(x)
				.ticks(d3.timeYear);

	var yAxis = d3.axisLeft(y);

	g.append("g")
		.attr("class", "x_axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
    .selectAll("text")
		.attr("x", -10)
		.attr("y", 0)
		.attr("transform", "rotate(-65)")
		.style("text-anchor", "end");

	g.append("g")
		.attr("class", "y_axis")
		.call(yAxis);

});