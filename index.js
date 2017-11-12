var selectedCountryId = "Afghanistan";
var countryIdMapping = d3.map();
var nestByCountryAndYear;
var ratioFinal;

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

var logScale = d3.scaleLog();

/* parse file */
d3.text("IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.csv", function (error, data) {
	if(error){
		console.log(error);
		return;
	}

	/* process data */
	var csvData = d3.csvParse(data);

	nestByCountryAndYear = d3.nest()
		.key(function(d){ return d.sex; })
		.key(function(d) { 
			return d.location_name; 
		}).sortKeys(d3.ascending)
		.key(function(d) { return d.year; }).sortKeys(d3.ascending)
		.map(csvData);

	d3.select(".loaderPosition").remove();

	/* create axes */
	g.append("g")
		.attr("class", "x_axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
    .selectAll("text")
		.attr("x", -10)
		.attr("y", 0)
		.attr("transform", "rotate(-65)")
		.style("text-anchor", "end");

	g.append("text")
		.attr("y", height + margin.top)
		.attr("x", width/2)
		.style("text-anchor", "middle")
		.text("Year");

	g.append("g")
		.attr("class", "y_axis")
		.call(yAxis);

	g.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - (margin.left / 2))
		.attr("x", 0 - (height / 2))
		.style("text-anchor", "middle")
		.text("Average Percentage");

	/* dropdown */
	var dropdownMenu = d3.select("#dropdown")
						.append("div")
						.attr("class", "country-select");

	dropdownMenu.append("label")
				.html("Select a location: ")
				.append("select")
				.attr("onchange", "selectCountry(this.value)");

	dropdownMenu.select("select")
				.selectAll("option")
				.data(nestByCountryAndYear.get(nestByCountryAndYear.keys()[0]).keys().sort())
				.enter()
				.append("option")
				.html(function(d){ return d; })
				.attr("value", function(d){ 
					return d; 
				});

	/* initial selected country */
	selectCountry(selectedCountryId);
	createSecondSvg();
});

var selectCountry = function(countryCode){
	selectedCountryId = countryCode;

	/* adjust y-axis */
	y.domain(getDomain());

	d3.select(".y_axis")
		.transition()
    	.duration(1000)
		.call(yAxis);

	/* redraw line and points */
	g.select(".country").remove();

	g.append("g")
		.attr("class", "country");

	drawLines();

	drawPoints();

	processRatioData();
	drawSecondGraph();
}

var verticalLine = d3.line()
	.x(function(d){
		return x(new Date("2010", 0, 1, 0)); })
	.y(function(d){
		return y(d.yVal);
	});

/* create lines */
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

var processRatioData = function(){
	var ratioData = {};
	nestByCountryAndYear.entries().forEach(function(oneGender){
		ratioData[oneGender.key] = oneGender.value.get(selectedCountryId).values();
	});
	console.log(ratioData);

	var ratioYearsF = {};
	var femaleYears = ratioData["female"].forEach(function(d){
		ratioYearsF[d[0].year] = getMean(d);
	});
	console.log(ratioYearsF);

	var ratioYearsM = {};
	var maleYears = ratioData["male"].forEach(function(d){
		ratioYearsM[d[0].year] = getMean(d);
	});
	console.log(ratioYearsM);

	ratioFinal = [];
	ratioData["female"].forEach(function(d){
		ratioFinal.push(
			{ 
				year: d[0].year,
				value: logScale(ratioYearsM[d[0].year]) - logScale(ratioYearsF[d[0].year])
			}
		);
	});
	console.log(ratioFinal);
}

var createNewPoints = function(data){
	return g.selectAll(".country")
		.append("g")
		.selectAll("circle")
		.data(data.value.get(selectedCountryId).values())
		.enter().append("circle")
		.attr("cx", function(d){ return x(new Date(d[0].year, 0, 1, 0)); })
		.on("mouseover", function(d){
			d3.selectAll(".y" + d[0].year)
				.classed("nonHoverPoint", false)
				.classed("hoverPoint", true);

			drawTooltip(this.id, d);
		})
		.on("mouseout", function(d){
			d3.selectAll(".y" + d[0].year)
				.classed("hoverPoint", false)
				.classed("nonHoverPoint", true);

			d3.select("#tooltip").remove();
		})
		.attr("class", function(d){ return "point nonHoverPoint y" + d[0].year; });
}

var drawPoints = function(){
	nestByCountryAndYear.entries().forEach(function(oneGender){
		createNewPoints(oneGender)
		.attr("cy", function(d){ return y(getMean(d)); })
		.attr("id", oneGender.key);
	});
}

var drawTooltip = function(currId, dataForAYear){
	var enterTextBox = d3.select("body")
				.append("div")
				.attr("id", "tooltip");

	enterTextBox
		.style("left", (d3.event.pageX) - 35 + "px")		
        .style("top", (d3.event.pageY) - 60 + "px");

	enterTextBox
		.append("p")
		.append("strong")
		.attr("id", "header")
		.text("Average " + currId);

	enterTextBox
		.append("p")
		.attr("id", "percentage")
		.text(d3.format(".4p")(getMean(dataForAYear)));
}