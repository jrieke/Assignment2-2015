d3.select('#content').style('visibility', 'hidden');

d3.json('/randomFollows', function(error, data) {

	var cols = {};
	cols['You'] = 'green';
	cols[data.user.username] = 'red';

	// TODO: Handle error
	var categories = ['media', 'follows', 'followed_by'];
	categories.forEach(function(category) {
		c3.generate({
			bindto: '#chart_' + category,
		    data: {
		        columns: [
		            [data.user.username, data.user.counts[category]],
		            ['You', 100]
		        ],
		        colors: cols,
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
	d3.select('#loading_spinner').style('display', 'none');
	d3.select('#content').style('visibility', 'visible');
});

