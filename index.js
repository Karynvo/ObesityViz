var debug = 1;
var selectedCountryId = "AFG";
var countryIdMapping = d3.map();
var idCountryMapping = d3.map();
var selectCountry;
var entries;

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

var x = d3.scaleTime()
	.domain([new Date(1990, 0, 1, 0), new Date(2013, 0, 1, 0)])
	.range([0, width]);
	
var y = d3.scaleLinear()
	.domain([0, 1])
	.range([height, 0]);

var xAxis = d3.axisBottom(x)
			.ticks(d3.timeYear);

var yAxis = d3.axisLeft(y);

/* parse file */
d3.text("IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.csv", function (error, data) {
	if(error){
		console.log(error);
		return;
	}

	/* process data */
	var csvData = d3.csvParse(data);

	entries = d3.nest()
		.key(function(d) { 
			countryIdMapping.set(d.location_name, d.location);
			idCountryMapping.set(d.location, d.location_name);
			return d.location_name; 
		})
		.key(function(d) { return d.year; })
		.entries(csvData);

	if(debug){
		console.log(entries);
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

	g.append("g")
		.attr("class", "y_axis")
		.call(yAxis);

	/* dropdown */
	var dropdownMenu = d3.select("body")
						.append("div")
						.attr("class", "country-select");

	dropdownMenu.append("label")
				.html("Select a location: ")
				.append("select")
				.attr("onchange", "selectCountry(this.value)");


	dropdownMenu.select("select")
				.selectAll("option")
				.data(entries)
				.enter()
				.append("option")
				.html(function(d){ return d.key; })
				.attr("value", function(d){ 
					// if(debug) console.log(d.values[0].values[0].location);
					return countryIdMapping.get(d.key); 
				});

	/* initial selected country */
	selectCountry(selectedCountryId);

});

var selectCountry = function(countryCode){
	console.log(countryCode);

	selectedCountryId = countryCode;
	selectedCountry = findCountry(selectedCountryId);

	/* change color */
	d3.selectAll(".turnRed")
		.classed("turnRed", false)
		.classed("line", true);

	g.select(".country").remove();

	d3.select("#" + countryCode)
		.classed("line", false)
		.classed("turnRed", true);

	g.append("g")
		.attr("class", "country")
		.append("path")
		.attr("class", "turnRed")
		.attr("id", selectedCountryId)
		.attr("d", line(selectedCountry.values));
}

/* create lines */
var line = d3.line()
			.x(function(d){ return x(new Date(d.key, 0, 1, 0)); })
			.y(function(d){ 
				var mean = d3.mean(d.values, function(d){ return d.mean; });
				return y(mean); 
			});

var findCountry = function(){
	for (var i = 0; i < entries.length; i++) {
		if(entries[i].key === idCountryMapping.get(selectedCountryId)){
			console.log("Found");
			console.log(entries[i]);
			return entries[i];
		}
	};
}

