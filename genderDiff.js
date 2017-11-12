var margin2 = { top: 50, right: 50, bottom: 100, left: 50 },
	width2 = 500 - margin2.left - margin2.right,
	height2 = 640 - margin2.top - margin2.bottom;

var svg2 = d3.select('#viz2')
		.attr('width', width2 + margin2.left + margin2.right)
		.attr('height', height2 + margin2.top + margin2.bottom);
	g2 = svg2.append('g')
		.attr('transform', 'translate(' + 
		margin2.left + ',' + margin2.top + ')');

var x2 = d3.scaleTime()
	.domain([new Date(1990, 0, 1, 0), new Date(2013, 0, 1, 0)])
	.range([0, width2]);

var y2 = d3.scaleLinear()
	.domain([-0.5, 0.5])
	.range([height2, 0]);

var xAxis2 = d3.axisBottom(x2)
		.ticks(d3.timeYear);

var yAxis2 = d3.axisLeft(y2);

var createSecondSvg = function(){
	/* create axes */
	g2.append("g")
		.attr("class", "x_axis2")
		.attr("transform", "translate(0," + height2/2 + ")")
		.call(xAxis2)
    .selectAll("text")
		.attr("x", -10)
		.attr("y", 0)
		.attr("transform", "rotate(-65)")
		.style("text-anchor", "end");

	g2.append("g")
		.attr("class", "y_axis2")
		.call(yAxis2);

	g2.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - (margin2.left / 2))
		.attr("x", 0 - (height2 / 2))
		.style("text-anchor", "middle")
		.text("Average Percentage");
}

var drawSecondGraph = function(){
	g2.selectAll(".bar").remove();

	g2.selectAll(".bar")
		.data(ratioFinal)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x2(new Date(d.year, 0, 1, 0)); })
		.attr("y", function(d) {
			if(d.value < 0) 
				return height2/2;
			return y2(d.value); 
		})
		.attr("width", width2/25)
		.attr("height", function(d) { 
			console.log(height2/2);
			console.log(y2(d.value));
			console.log(d.value);
			if(d.value < 0)
				return y2(d.value) - height2/2; 
			return height2/2 - y2(d.value); 
		});
}