
d3.select('#content').style('visibility', 'hidden');

var projection = d3.geo.robinson();

var svg = d3.select('#chart');
var path = d3.geo.path()
	.projection(projection);

var alphabet = 'abcdefghijklmnopqrstuvwxyz_.';

// var g = svg.append("g");

// d3.json('json/sdpd_beats_0.1.json', function(error, topology) {
// 	// console.log(topology);
// 	svg.selectAll('path')
// 		.data(topojson.object(topology, topology.objects.sdpd_beats_wgs8).geometries)
// 		.enter()
// 		.append('path')
// 		.attr('d', path);

// 		// d3.select('#loading_spinner').style('display', 'none');
// 		// d3.select('#content').style('visibility', 'visible');
// 	});

d3.json('json/world-110m2.json', function(error, topology) {
	if (error)
		console.log(error);

	svg.selectAll('path')
		.data(topojson.object(topology, topology.objects.countries).geometries)
		.enter()
		.append('path')
		.attr('d', path);

	d3.select('#content').style('visibility', 'visible');

	d3.json('/followsImages', function(error, data) {
		if (error)
			console.log(error);

		var colors = {};
		data.images.forEach(function(d) {
			if (!colors.hasOwnProperty(d.user.username)) {
				var count = 0;
				// TODO: What if username has less than 3 letters
				for (var i = 0; i < 3; i++)
					count += alphabet.indexOf(d.user.username[i]);
				colors[d.user.username] = 'hsl(' + 16 * (count % 20) + ', 100%, 50%)';
			}
		});
		// console.log(data.images);

		// svg.selectAll('text')
		// 	.data(data.images)
		// 	.enter()
		// 	.append('text')
		// 	.attr('x', function(d) { return projection([d.location.longitude, d.location.latitude])[0]; })
		// 	.attr('y', function(d) { return projection([d.location.longitude, d.location.latitude])[1]; })
		// 	.text("hello")
		// 	.attr('fill', 'black')
		// 	.style('z-index', 10);

		var tip = d3.tip()
		    .attr('class', 'd3-tip')
		    .offset([-10, 0])
		    .html(function(d) {
		    	if (d.likes.count >= 1000)
		    		var likes = Math.round(d.likes.count/1000) + ' k';
		    	else
		    		var likes = d.likes.count;
		      	return "<span style='font-size: 1.5em;'>" + d.user.username + "</span><br><span style='color: " + colors[d.user.username] + ";'><i class='mdi-action-thumb-up'></i>&nbsp;" + likes + "</span>";
		    });

		  svg.call(tip);

		svg.selectAll('circle')
			.data(data.images)
			.enter()
			.append('a')
			.attr('xlink:href', function(d) {return d.link;})
			.attr('xlink:show', 'new')
			.append('circle')
			.attr('cx', function(d) { return projection([d.location.longitude, d.location.latitude])[0]; })
			.attr('cy', function(d) { return projection([d.location.longitude, d.location.latitude])[1]; })
			// TODO: Make circle size relative to highest number of likes
			.attr('r', '8px')//function(d) { console.log(d.likes.count);return d.likes.count/50000 + 'px'; })
			.attr('fill', function(d) {
				return colors[d.user.username];
			})
			.style('opacity', '0.4')
			.on('mouseover', function(d) {
				d3.select(this)
					.attr('r', '12px');

				d3.selectAll('circle')
					.attr('fill', function(d2) {
						if (d2.user.username != d.user.username)
							return '#aaaaaa';
						else
							return colors[d.user.username];
					});

				tip.show(d);
			})
			.on('mouseout', function(d) {
				d3.select(this)
					.attr('r', '8px');
				d3.selectAll('circle')
					.attr('fill', function(d) {
						return colors[d.user.username];
					});
				tip.hide(d);
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