var debug = 1;
var selectedCountryId = "Afghanistan";
var countryIdMapping = d3.map();
var idCountryMapping = d3.map();
var selectedCountry;
var nestByCountryAndYear;
var selectedYear;

lineTypeEnum = {
    MIN : 0,
    MEAN : 1,
    MAX : 2
}

/* create svg */
var margin = { top: 50, right: 50, bottom: 100, left: 100 },
	width = 960 - margin.left - margin.right,
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

/* parse file */
d3.text("IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.csv", function (error, data) {
	if(error){
		console.log(error);
		return;
	}

	/* process data */
	var csvData = d3.csvParse(data);

	nestByCountryAndYear = d3.nest()
		.key(function(d) { 
			countryIdMapping.set(d.location_name, d.location);
			idCountryMapping.set(d.location, d.location_name);
			return d.location_name; 
		})
		.key(function(d) { return d.year; })
		.map(csvData);

	d3.select(".loaderPosition").remove();

	if(debug){
		console.log(nestByCountryAndYear);
		console.log(idCountryMapping);
	}

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
				.data(nestByCountryAndYear.keys())
				.enter()
				.append("option")
				.html(function(d){ return d; })
				.attr("value", function(d){ 
					// if(debug) console.log(d.values[0].values[0].location);
					return d; 
				});

	/* initial selected country */
	selectCountry(selectedCountryId);

});

var selectCountry = function(countryCode){
	selectedCountryId = countryCode;
	// selectedCountry = findCountry(selectedCountryId);
	selectedCountry = nestByCountryAndYear.get(selectedCountryId);

	console.log(selectedCountry);

	/* adjust y-axis */
	y.domain([findMinOrMaxMean(true), findMinOrMaxMean(false)]);

	g.select(".y_axis").remove();

	g.append("g")
		.attr("class", "y_axis")
		.call(yAxis);

	/* redraw line and points */
	g.select(".country").remove();

	g.append("g")
		.attr("class", "country");

	drawLines();

	drawPoints();
}

/* create lines */
var line = d3.line()
		.x(function(d){
			return x(new Date(d[0].year, 0, 1, 0)); })
		.y(function(d){
			return y(getMean(d, lineTypeEnum.MEAN));
		});

var lineMin = d3.line()
		.x(function(d){ return x(new Date(d[0].year, 0, 1, 0)); })
		.y(function(d){ 
			return y(getMean(d, lineTypeEnum.MIN));
		});

var lineMax = d3.line()
		.x(function(d){ return x(new Date(d[0].year, 0, 1, 0)); })
		.y(function(d){
			return y(getMean(d, lineTypeEnum.MAX));
		});

var findMinOrMaxMean = function(getMin){
	var allYears = [];
	var selectString = getMin ? "lower" : "upper";

	selectedCountry.values().forEach(function(oneYear){
		allYears.push(d3.mean(oneYear, function(elem){
			return elem[selectString];
		}));
	});

	return getMin ? d3.min(allYears) : d3.max(allYears);
}

var getMean = function(dataForAYear, type){
	return d3.mean(dataForAYear, function(element){
		if(type == lineTypeEnum.MEAN)
			return element["mean"];
		if(type == lineTypeEnum.MIN)
			return element["lower"];
		if(type == lineTypeEnum.MAX)
			return element["upper"];
	});
}

var createNewPath = function(){
	return g.selectAll(".country")
		.append("path")
		.attr("id", selectedCountryId);
}

var drawLines = function(){
	createNewPath()
		.attr("d", line(selectedCountry.values()))
		.attr("class", "line meanColor");

	createNewPath()
		.attr("d", lineMin(selectedCountry.values()))
		.attr("class", "line minColor");

	createNewPath()
		.attr("d", lineMax(selectedCountry.values()))
		.attr("class", "line maxColor");
}

var createNewPoints = function(){
	return g.selectAll(".country")
		.append("g")
		.selectAll("circle")
		.data(selectedCountry.values())
		.enter().append("circle")
		.attr("cx", function(d){ return x(new Date(d[0].year, 0, 1, 0)); })
		.on("mouseover", function(d){
			d3.select(this)
				.classed("nonHoverPoint", false)
				.classed("hoverPoint", true);

			drawTooltip(this.className["baseVal"], d);
		})
		.on("mouseout", function(d){
			d3.select(this)
				.classed("hoverPoint", false)
				.classed("nonHoverPoint", true);

			d3.select("#tooltip").remove();
		})
		.on("click", function(d){
			selectedYear = d;

			d3.select(".selectPoint")
				.classed("selectPoint", false);

			d3.select(this)
				.classed("selectPoint", true);

			// drawAges();
		});
}

var drawPoints = function(){
	createNewPoints()
		.attr("cy", function(d){ return y(getMean(d, lineTypeEnum.MEAN)); })
		.attr("class", "point nonHoverPoint meanColor");

	createNewPoints()
		.attr("cy", function(d){ return y(getMean(d, lineTypeEnum.MIN)); })
		.attr("class", "point nonHoverPoint minColor");

	createNewPoints()
		.attr("cy", function(d){ return y(getMean(d, lineTypeEnum.MAX)); })
		.attr("class", "point nonHoverPoint maxColor");
}

var getPercentText = function(classes, dataForAYear){
	if(classes.includes("mean"))
		return getMean(dataForAYear, lineTypeEnum.MEAN);
	if(classes.includes("min"))
		return getMean(dataForAYear, lineTypeEnum.MIN);
	if(classes.includes("max"))
		return getMean(dataForAYear, lineTypeEnum.MAX);
}

var getHeaderText = function(classes){
	if(classes.includes("mean"))
		return "Average mean";
	if(classes.includes("min"))
		return "Average lower";
	if(classes.includes("max"))
		return "Average upper";
}

var drawTooltip = function(classes, dataForAYear){
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
		.text(getHeaderText(classes));

	enterTextBox
		.append("p")
		.attr("id", "percentage")
		.text(d3.format(".4p")(getPercentText(classes, dataForAYear)));
}