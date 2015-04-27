d3.select('#content').style('visibility', 'hidden');

var projection = d3.geo.robinson();

var svg = d3.select('#chart');
var path = d3.geo.path()
	.projection(projection);
// var g = svg.append("g");

d3.json('json/world-110m2.json', function(error, topology) {
	// console.log(topology);
	svg.selectAll('path')
		.data(topojson.object(topology, topology.objects.countries).geometries)
		.enter()
		.append('path')
		.attr('d', path);

	d3.json('/followsImages', function(error, data) {
		console.log(data.images);

		// svg.selectAll('text')
		// 	.data(data.images)
		// 	.enter()
		// 	.append('text')
		// 	.attr('x', function(d) { return projection([d.location.longitude, d.location.latitude])[0]; })
		// 	.attr('y', function(d) { return projection([d.location.longitude, d.location.latitude])[1]; })
		// 	.text("hello")
		// 	.attr('fill', 'black')
		// 	.style('z-index', 10);

		svg.selectAll('circle')
			.data(data.images)
			.enter()
			.append('circle')
			.attr('cx', function(d) { return projection([d.location.longitude, d.location.latitude])[0]; })
			.attr('cy', function(d) { return projection([d.location.longitude, d.location.latitude])[1]; })
			.attr('r', function(d) { console.log(d.likes.count);return d.likes.count/100000 + 'px'; })
			.attr('fill', 'blue')
			.attr('stroke', 'blue')
			.attr('stroke-width', 0)
			.style('opacity', '0.5')
			.on('mouseover', function() {
				d3.select(this)
					.attr('stroke-width', 4);
			})
			.on('mouseout', function() {
				d3.select(this)
					.attr('stroke-width', 0);
			});

		
// 			.on("mouseover",(function(){
//     d3.select("text").remove();
//     var text = group
//     .append("text")
//     .attr("x",-30)
//     .attr("y",-10)
//     .selectAll('tspan')
//     // .data([cityName[$(this).attr('id')], $(this).attr('id') + '%'])
//     // .enter()
//     .append('tspan')
//       .attr('x', 0)
//       .attr('dx', '-1em')
//       .attr('dy', '-1ddm')//function (d, i) { return (2 * i - 1) + 'em'; })
//       .text('hello');

// })); 
			
		d3.select('#loading_spinner').style('display', 'none');
		d3.select('#content').style('visibility', 'visible');

	});

	
});