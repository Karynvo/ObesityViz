var margin2 = { top: 50, right: 50, bottom: 100, left: 50 },
	width2 = 500 - margin2.left - margin2.right,
	height2 = 640 - margin2.top - margin2.bottom,
	oneSideHeight = height2/2;

var svg2 = d3.select('#viz2')
		.attr('width', width2 + margin2.left + margin2.right)
		.attr('height', height2 + margin2.top + margin2.bottom);
	g2 = svg2.append('g')
		.attr('transform', 'translate(' + 
		margin2.left + ',' + margin2.top + ')');

var x2 = d3.scaleBand()
	.domain(d3.timeYears(new Date(1990, 0, 1, 0), new Date(2014, 0, 1, 0)))
	.rangeRound([0, width2])
	.padding(0.1);

var y2 = d3.scaleLinear()
	.domain([-0.55, 0.55])
	.range([height2, 0]);

var xAxis2 = d3.axisBottom(x2)
		.ticks(d3.timeYear)
		.tickFormat(d3.timeFormat("%Y"));

var yAxis2 = d3.axisLeft(y2);

var logScale = d3.scaleLog();

var createSecondSvg = function(){
	createAxes(g2, oneSideHeight, xAxis2, yAxis2, "x_axis2", "y_axis2");
}

var drawBars = function(){
	g2.selectAll(".bar").remove();

	g2.selectAll(".bar")
		.data(ratioFinal)
		.enter().append("rect")
		.attr("class", function(d){ return "bar nonHoverBar y" + d.year})
		.attr("x", function(d) { return x2(new Date(d.year, 0, 1, 0)); })
		.attr("y", function(d) {
			return Math.min(oneSideHeight, y2(d.value)); 
		})
		.attr("width", x2.bandwidth())
		.attr("height", function(d) { 
			return Math.abs(y2(d.value) - oneSideHeight);
		})
		.attr("id", function(d) { 
			if(d.value < 0)
				return "under"; 
			return "over"; 
		})
		.on("mouseover", function(d){
			elementsInCurrYear = d3.selectAll(".y" + d.year);
			
			addMouseover();

			drawBarTooltip(d.value);
		})
		.on("mouseout", function(d){
			addMouseout();

			d3.select("#tooltip").remove();
		});
}

var drawBarTooltip = function(ratio){
	createToolTip();

	d3.select("#header")
		.text("Log ratio males to females");

	d3.select("#percentage")
		.text(d3.format(".4")(ratio));
}

var processRatioData = function(){
	var ratioData = {};
	nestByCountryAndYear.entries().forEach(function(oneGender){
		ratioData[oneGender.key] = oneGender.value.get(selectedCountryId).values();
	});

	var ratioYearsF = {};
	var femaleYears = ratioData["female"].forEach(function(d){
		ratioYearsF[d[0].year] = getMean(d);
	});

	var ratioYearsM = {};
	var maleYears = ratioData["male"].forEach(function(d){
		ratioYearsM[d[0].year] = getMean(d);
	});

	ratioFinal = [];
	ratioData["female"].forEach(function(d){
		ratioFinal.push(
			{ 
				year: d[0].year,
				value: logScale(ratioYearsM[d[0].year]) - logScale(ratioYearsF[d[0].year])
			}
		);
	});
	// console.log(ratioFinal);
}

var drawBarGraph = function(){
	processRatioData();
	drawBars();
}