---
layout: post
title: Presentation on The Mode Tree at Papers We Love Too
date: 2015-04-06 20:10
comments: true
categories: algorithms math d3 latex talks
---
<script src="http://d3js.org/d3.v2.js"></script>
<div>
<style type="text/css">

.chart {
  font-size: 10px;
  margin-top: -40px;
}


.axis path, .axis line {
  fill: none;
  stroke: #000;
  stroke-width: 2;
  shape-rendering: crispEdges;
}

.area {
  fill: indianred;
  fill-opacity: 0.25;
  stroke: #000;
  stroke-opacity: 0.5;
}

.point {
  fill: #126ED5;
  fill-opacity: 0.75;
  stroke: none;
  stroke-width: 1
  stroke-opacity: 0.5;
}

.kernelline {
  fill: none;
  stroke: #D04400;
  stroke-width: 1;
  stroke-opacity: 0.75;
}

.kdeline {
  fill: none;
  stroke: #CB17CE;
  stroke-opacity: 0.75;
  stroke-width: 4
}

.summedarea {
  fill: steelblue;
  fill-opacity: 0.75;
  stroke: #000;
  stroke-opacity: 0.5;
}

.bar rect {
  fill: steelblue;
  fill-opacity: 0.75;
  shape-rendering: crispEdges;
  stroke: #000;
  stroke-opacity: 0.5;

}

.bar text {
  fill: #fff;
}

.equation {
  opacity: 0;
}

.kernelwidth {
  stroke: #2DB15D;
  stroke-width: 4;
}

.treeline {
  fill: none;
  stroke: #000;
  stroke-opacity: 0.75;
  stroke-width: 2
}

.treeconnector {
  fill: none;
  stroke: #999;
  stroke-opacity: 0.75;
  stroke-width: 2
}

</style>
</div>

I recently gave a mini talk on [The Mode Tree: A Tool for Visualization of Nonparametric Density Features](http://adereth.github.io/oneoff/Mode%20Trees.pdf) at [Papers We Love Too](http://www.meetup.com/papers-we-love-too/) in San Francisco.  The talk is just the first 10 minutes:

<iframe width="560" height="315" src="https://www.youtube.com/embed/T3Bt9Tn6P5c" frameborder="0" allowfullscreen></iframe>

I did the entire presentation as one huge sequence of animations using [D3.js](http://d3js.org/).  The Youtube video doesn't capture the glory that is SVG, so [I've posted the slides](/oneoff/pwl-draft/scratch.html).

I also finally got to apply the technique that I wrote about in my [Colorful Equations with MathJax post](/blog/2013/11/27/colorful-equations/) from over a year ago, only instead of coloring explanatory text, the colors in the accompanying chart match:

<div style="font-size: 100%;">
$$
\definecolor{kernel}{RGB}{217,86,16}
\definecolor{kde}{RGB}{203,23,206}
\definecolor{point}{RGB}{18,110,213}
\definecolor{width}{RGB}{45,177,93}
\color{kde}\hat{f}_{\color{width}h}\color{black}(x) \color{black} = \frac{1}{n\color{width}h}\color{black}\sum\limits_{i=1}^n \color{kernel}K\color{black}(\frac{x-\color{point}X_i}{\color{width}h})
$$
</div>
<div id='chart-1'></div>
<script type='text/javascript'>
var data = [
{value: 13.1138}, {value: 10.6519}, {value: 20.5735}, {value: 7.89327}, {value: 9.02554}, {value: 20.8411}, {value: 8.84072}, {value: 10.6273}, {value: 13.5194}, {value: 17.9757}, {value: 10.1086}, {value: 8.68131}, {value: 7.16192}, {value: 19.9496}, {value: 8.77111}, {value: 19.5314}, {value: 9.40915}, {value: 12.8664}, {value: 23.1322}, {value: 13.5008}];

function drawChart(data,chart,height) {
$(chart).empty();
var margin = {top: 50, right: 40, bottom: 40, left: 60};
var width = $('article').width() || 720;
var x = d3.scale.linear().domain([0, 30]).range([0, width - margin.left - margin.right]);

           var xAxis = d3.svg.axis()
                         .scale(x)
                         .orient('bottom')
                         .tickPadding(8)
                         .ticks(8);

           var svg = d3.select(chart).append('svg')
                       .attr('width', width)
                       .attr('height', height)
                       .attr('class', 'chart')
                       .append('g')
                       .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

           svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
              .call(xAxis);

           var y0 = height - margin.top - margin.bottom;


               var points = svg.selectAll('.chart')
                               .data(data)
	                       .enter().append('circle')
                               .classed('point', true)
                               .attr("id", function(d, i) { return "point" + i })
                               .attr('cx', function(d, i) { return x(d.value) })
                               .attr('cy', y0)
                               .attr('r', 3.25);

               var y = d3.scale.linear()
                         .domain([0, 1])
                         .range([height - margin.top - margin.bottom, 0]);

               function subpoints(d, stddev) {
                   return d3.range(d.value - 7, d.value + 7, 0.1).map(
                       function (d2,i,a) {
                           return {value: d2, height: gaussian(d2, d.value, stddev)};
                       });
               }

               var widthLine = svg.append('path')
                   .attr('class', 'kernelwidth')
                   .attr("d", d3.svg.line()([[x(data[0].value - 1), y(0) + 2,],[x(data[0].value), y(0) + 2]]))
                   .style('opacity', 0);

               widthLine.transition().duration(1000).style('opacity', 1);

var stddev = 1;

           var scale = 0.5 / Math.sqrt(2 * Math.PI) / 2;
           function gaussian(x, mean, sigma) {
               var z = (x - mean) / sigma;
               return scale * Math.exp(-0.5 * z * z) / sigma;
           };


               var kernels = data.sort(function(x,y){return x.value - y.value}).map(function(d, i) {
                   var line = d3.svg.line()
                                .x(function(d) { return x(d.value); })
                                .y(function(d) { return y(d.height) });

                   return svg.append('path')
                             .attr('class', 'kernelline')
                             .attr("d", line(subpoints(d, stddev)))
                             .style('opacity', 1);

               });

                   var intermediateAreaPoints =
                       d3.range(0, 30, 0.01).concat(data.map(function(x) {return x.value}))
                                      .sort(function(a,b){return a-b})
                                      .map(
                                          function (x,i2,a) {
                                              var y = 0;
                                              //console.log(x)
                                              data.forEach(function(d) {
                                                  y += gaussian(x, d.value, stddev)
                                              });
                                              return {value: x, height: y};
                                          }
                                      );
                   var line = d3.svg.line()
                                .x(function(d) { return x(d.value); })
                                .y(function(d) { return y(d.height); });


        var summedArea = svg.append('path')
            .attr('class', 'kdeline')
                .attr("d", line(intermediateAreaPoints));



}

function drawChartWithResize(data, chart, height) {
    drawChart(data, chart, height);
        $(window).resize(function() {drawChart(data, chart, height); })
};


drawChartWithResize(data, '#chart-1', 300);


</script>
Any questions or feedback on the presentation are welcome... thanks!
