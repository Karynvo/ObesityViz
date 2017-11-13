var selectedCountryId = "Afghanistan";
var countryIdMapping = d3.map();
var nestByCountryAndYear;
var ratioFinal;
var elementsInCurrYear;

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

	intializeTitles();

	drawAxes();

	createDropdown();

	/* initial selected country */
	selectCountry(selectedCountryId);
});

var selectCountry = function(countryCode){
	selectedCountryId = countryCode;

	drawLineGraph();

	drawBarGraph();
}

var createToolTip = function(){
	var enterTextBox = d3.select("body")
				.append("div")
				.attr("id", "tooltip");

	enterTextBox
		.style("left", (d3.event.pageX) - 35 + "px")		
        .style("top", (d3.event.pageY) - 60 + "px");

    enterTextBox
    	.append("p")
		.append("strong")
		.attr("id", "header");

	enterTextBox
		.append("p")
		.attr("id", "percentage")
}

var addMouseover = function(){
	elementsInCurrYear
			.filter("circle")
			.classed("nonHoverPoint", false)
			.classed("hoverPoint", true);

	elementsInCurrYear
			.filter("rect")
			.classed("nonHoverBar", false)
			.classed("hoverBar", true);	
}

var addMouseout = function(){
	elementsInCurrYear
			.filter("circle")
			.classed("hoverPoint", false)
			.classed("nonHoverPoint", true);

	elementsInCurrYear
			.filter("rect")
			.classed("hoverBar", false)
			.classed("nonHoverBar", true);
}

var createAxes = function(refG, currHeight, currXAxis, currYAxis, xAxisClass, yAxisClass){
	refG.append("g")
		.attr("class", xAxisClass)
		.attr("transform", "translate(0," + currHeight + ")")
		.call(currXAxis)
    .selectAll("text")
		.attr("x", -10)
		.attr("y", 0)
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "end");

	refG.append("g")
		.attr("class", yAxisClass)
		.call(currYAxis);
}

var drawAxes = function(){
	createAxes(g, height, xAxis, yAxis, "x_axis", "y_axis");
	createAxes(g2, oneSideHeight, xAxis2, yAxis2, "x_axis2", "y_axis2");
}

var intializeTitles = function(){
	d3.select("#vizTitle")
		.text("Prevalence Split By Sex");

	d3.select("#viz2Title")
		.text("Log Base 2 Ratio of Males to Females");
}

var createDropdown = function(){
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
}