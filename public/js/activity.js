d3.select('#progress').style('visibility', 'visible');

var margin = {top: 20, right: 20, bottom: 100, left: 40};
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

//define scale of x to be from 0 to width of SVG, with .1 padding in between
var scaleX = d3.scale.ordinal()
  .rangeRoundBands([0, width], 0.1);

//define scale of y to be from the height of SVG to 0
var scaleY = d3.scale.linear()
  .range([height, 0]);

//define axes
var xAxis = d3.svg.axis()
  .scale(scaleX)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(scaleY)
  .orient("left");

//create svg
var svg = d3.select("#chart")
  // .attr("width", width + margin.left + margin.right)
  // .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//get json object which contains media counts
d3.json('/mediaCounts', function(error, data) {
  
  var unsorted_usernames = data.users.map(function(d) { return d.username; });

  //set domain of x to be all the usernames contained in the data
  scaleX.domain(unsorted_usernames);
  //set domain of y to be from 0 to the maximum media count returned
  scaleY.domain([0, d3.max(data.users, function(d) { return d.counts.media; })]);

  //set up x axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {
      return "rotate(-65)";
    });

  //set up y axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Number of Photos");

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<span style='color:brown; font-size: 2em;'>" + d.counts.media + "</span><br>" + d.full_name;
    });

  svg.call(tip);

  //set up bars in bar graph
  svg.selectAll(".bar")
    .data(data.users)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return scaleX(d.username); })
    .attr("width", scaleX.rangeBand())
    .attr("y", function(d) { return scaleY(d.counts.media); })
    .attr("height", function(d) { return height - scaleY(d.counts.media); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

  d3.select('#progress').style('visibility', 'hidden');
  d3.select('#content').style('visibility', 'visible');


  var sorted_usernames = data.users.slice();
  sorted_usernames.sort(function(a, b) {
      return d3.ascending(a.counts.media, b.counts.media);
    });
  sorted_usernames = sorted_usernames.map(function(d) { return d.username; });

  var sorted = false;

  d3.select("#sort_button")
    .on("click", function() {

      if (!sorted) {

        scaleX.domain(sorted_usernames);
        var bars = svg.selectAll(".bar")
          .sort(function(a, b) {return d3.ascending(a.counts.media, b.counts.media);})
          
        d3.select("#sort_button")
          .text("Reset")
          .attr("class", "btn waves-effect red right");

      } else {

        scaleX.domain(unsorted_usernames);
        var bars = svg.selectAll(".bar");

        d3.select("#sort_button")
          .text("Sort")
          .attr("class", "btn waves-effect green right");

      }

      bars.transition()
          .duration(1000)
          .attr("x", function(d) {
            return scaleX(d.username);
          });

      svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis)
        .selectAll("text")  
        .style("text-anchor", "end");

      sorted = !sorted;

    });

  

});



