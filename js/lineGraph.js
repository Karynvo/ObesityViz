/* create svg */
var margin = { top: 50, right: 50, bottom: 100, left: 100 },
	width = 700 - margin.left - margin.right,
	height = 640 - margin.top - margin.bottom;

var svg = d3.select('#viz')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);
	g = svg.append('g')
		.attr('transform', 'translate(' + 
		margin.left + ',' + margin.top + ')');

var x = d3.scaleTime()
	.domain([new Date(1990, 0, 1, 0), new Date(2013, 0, 1, 0)])
	.range([0, width]);
	
var y = d3.scaleLinear()
	.range([height, 0]);

var xAxis = d3.axisBottom(x)
			.ticks(d3.timeYear);

var yAxis = d3.axisLeft(y)
			.tickFormat(d3.format(".3p"));

var line = d3.line()
		.x(function(d){
			return x(new Date(d[0].year, 0, 1, 0)); })
		.y(function(d){
			return y(getMean(d));
		});

var getDomain = function(){
	var allYears = [];

	nestByCountryAndYear.each(function(oneGender){
		var currCountry = oneGender.get(selectedCountryId);
		currCountry.values().forEach(function(oneYear){
			allYears.push(d3.mean(oneYear, function(elem){
				return elem["mean"];
			}));
		});
	});

	return [d3.min(allYears), d3.max(allYears)];
}

var getMean = function(dataForAYear){
	return d3.mean(dataForAYear, function(element){
		return element["mean"];
	});
}

var createNewPath = function(){
	return g.selectAll(".country")
		.append("path");
}

var drawLines = function(){
	nestByCountryAndYear.entries().forEach(function(oneGender){
		createNewPath()
		.attr("d", line(oneGender.value.get(selectedCountryId).values()))
		.attr("class", "line")
		.attr("id", oneGender.key);
	});
}

var createNewPoints = function(data){
	return g.selectAll(".country")
		.append("g")
		.selectAll("circle")
		.data(data.value.get(selectedCountryId).values())
		.enter().append("circle")
		.attr("cx", function(d){ return x(new Date(d[0].year, 0, 1, 0)); })
		.attr("class", function(d){ return "point nonHoverPoint y" + d[0].year; })
		.on("mouseover", function(d){
			elementsInCurrYear = d3.selectAll(".y" + d[0].year);
			
			addMouseover();

			drawPointTooltip(this.id, d);
		})
		.on("mouseout", function(d){
			addMouseout();

			d3.select("#tooltip").remove();
		});
}

var drawPoints = function(){
	nestByCountryAndYear.entries().forEach(function(oneGender){
		createNewPoints(oneGender)
		.attr("cy", function(d){ return y(getMean(d)); })
		.attr("id", oneGender.key);
	});
}

var drawPointTooltip = function(currId, dataForAYear){
	createToolTip()

	d3.select("#header")
		.text("Mean % " + currId);

	d3.select("#percentage")
		.text(d3.format(".4p")(getMean(dataForAYear)));
}

var resetCanvas = function(){
	g.select(".country").remove();

	g.append("g")
		.attr("class", "country");
}

var adjustYAxis = function(){
	y.domain(getDomain());

	d3.select(".y_axis")
		.transition()
    	.duration(1000)
		.call(yAxis);
}

var drawLineGraph = function(){
	adjustYAxis();
	resetCanvas();

	drawLines();
	drawPoints();
}