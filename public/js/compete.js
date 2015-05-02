d3.select('#progress').style('visibility', 'visible');
d3.select('#content').style('visibility', 'hidden');

d3.json('/competitors', function(error, data) {

	d3.select('#competitors')
		.text('You vs. ' + data.user.username);

	var cols = {};
	cols['You'] = 'green';
	cols[data.user.username] = 'red';

	var num_wins = 0;

	// TODO: Handle error
	var categories = ['media', 'follows', 'followed_by'];
	categories.forEach(function(category) {
		num_wins += (data.you.counts[category] >= data.user.counts[category]);
		c3.generate({
			bindto: '#chart_' + category,
		    data: {
		        columns: [
		            [data.user.username, data.user.counts[category]],
		            ['You', data.you.counts[category]]
		        ],
		        // colors: cols,
		        type: 'donut'
		    },
		    donut: {
		    	label: {
		    		show: false
		    	}
		    },
		    size: {
		        height: 180
		    }
		});
	});

	// d3.select('#result')
	// 	.html("<span style='font-size: 2em'>" + num_wins + "</span> out of <span style='font-size: 2em;''>3</span>: You " + (num_wins >= 2 ? "win!" : "lose :(") )
	// 	.style('color', (num_wins >= 2 ? 'green' : 'red'));


	d3.select('#progress').style('visibility', 'hidden');
	d3.select('#content').style('visibility', 'visible');
});

