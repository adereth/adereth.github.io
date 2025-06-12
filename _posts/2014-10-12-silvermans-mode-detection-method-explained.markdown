---
layout: post
title: Silverman's Mode Estimation Method Explained
date: 2014-10-12 12:51
comments: true
categories: algorithms math
---
<script src="http://d3js.org/d3.v2.js"></script>
<div>
  <style type="text/css">

     .chart {
       font-size: 10px;
       margin-top: -40px;
     }

     .point {
       fill: steelblue;
       fill-opacity: 0.5;
       stroke: black;
       stroke-width: 1
       stroke-opacity: 0.5;
     }

     .axis path, .axis line {
       fill: none;
       stroke: #000;
       shape-rendering: crispEdges;
     }

     .area {
       fill: steelblue;
       fill-opacity: 0.25;
       stroke: #000;
       stroke-opacity: 0.5;
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


  </style>
</div>

<!-- Global Variables and Handlers: -->
<script type="text/javascript">

  var margin = {top: 50, right: 40, bottom: 40, left: 60},
      width = $('article').width() || 720;

  $(window).resize(function() {
    width = $('article').width() || 720;
  });

  function drawPoints(data, chart, height) {

    $(chart).empty();

    var x = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.value}) + 5])
        .range([0, width - margin.left - margin.right]);

    var y = d3.scale.ordinal()
        .domain(d3.range(data.length))
        .rangeRoundBands([height - margin.top - margin.bottom, 0], 0.2);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickPadding(8)
	.ticks(8);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickPadding(8)
        .tickSize(0);

    var svg = d3.select(chart).append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'chart')
	      .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    svg.selectAll('.chart')
        .data(data)
	    .enter().append('circle')
        .attr('class', 'point')
        .attr('cx', function(d, i) { return x(d.value) })
        .attr('cy', 0)
        .attr('r', 3);

    svg.append('g')
        .attr('class', 'x axis')
        .call(xAxis);

  }

  function drawPointsWithResize(data, chart, height) {
    drawPoints(data, chart, height);
    $(window).resize(function() {drawPoints(data, chart, height); })
  };


     function drawOverlappingDistributions(data, chart, height) {

       $(chart).empty();

       var x = d3.scale.linear()
                       .domain([0, d3.max(data, function(d) { return d.value}) + 5])
                       .range([0, width - margin.left - margin.right]);

       var y = d3.scale.linear()
                       .domain([0, 0.5])
                       .range([height - margin.top - margin.bottom, 0]);

       var xAxis = d3.svg.axis()
                         .scale(x)
                         .orient('bottom')
                         .tickPadding(8)
                         .ticks(8);

       var yAxis = d3.svg.axis()
                         .scale(y)
                         .orient('left')
                         .tickPadding(8)
                         .tickSize(0);

       var svg = d3.select(chart).append('svg')
                   .attr('width', width)
                   .attr('height', height)
                   .attr('class', 'chart')
                   .append('g')
                   .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

       var line = d3.svg.line()
                        .x(function(d) {return x(d.q)})
                        .y(function(d) {return y(d.p)})

       var scale = 1 / Math.sqrt(2 * Math.PI);
       function gaussian(x, mean, sigma) {
         var z = (x - mean) / sigma;
         return scale * Math.exp(-0.5 * z * z) / sigma;
       };

       function subpoints(d) {
         return d3.range(d.value - 4, d.value + 4, 0.1).map(
           function (d2,i,a) {
             return {value: d2, height: gaussian(d2, d.value, 1)};
           });
       }

       data.forEach(function(d) {

         var area = d3.svg.area()
                          .interpolate("monotone")
                          .x(function(d) { return x(d.value); })
                          .y0(y(0))
                          .y1(function(d) { return y(d.height); });

         svg.append('path')
            .attr('class', 'area')
            .attr("d", area(subpoints(d)))
       });

       svg.selectAll('.chart')
          .data(data)
          .enter().append('circle')
          .attr('class', 'point')
          .attr('cx', function(d, i) { return x(d.value) })
          .attr('cy', y(0))
          .attr('r', 3);

       svg.append('g')
          .attr('class', 'x axis')
          .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
          .call(xAxis);

     }

     function drawOverlappingDistributionsWithResize(data, chart, height) {
       drawOverlappingDistributions(data, chart, height);
       $(window).resize(function() {drawOverlappingDistributions(data, chart, height); })
     };


     function drawSummedDistributions(data, chart, height, stddev) {

       $(chart).empty();

       var scale = 1 / Math.sqrt(2 * Math.PI);
       function gaussian(x, mean, sigma) {
         var z = (x - mean) / sigma;
         return scale * Math.exp(-0.5 * z * z) / sigma;
       };

       var points = d3.range(0, 30, 0.01).concat(data.map(function(x) {return x.value}))
       .sort(function(a,b){return a-b})
                      .map(
         function (x,i,a) {
           var y = 0;
           data.forEach(function(d) {
             y += gaussian(x, d.value, stddev)
           });
           return {value: x, height: y};
         }

       );



       var x = d3.scale.linear()
                       .domain([0, d3.max(data, function(d) { return d.value}) + 5])
                       .range([0, width - margin.left - margin.right]);

       var y = d3.scale.linear()
                       .domain([0, d3.max(points, function(d) { return d.height})])
                       .range([height - margin.top - margin.bottom, 0]);

       var xAxis = d3.svg.axis()
                         .scale(x)
                         .orient('bottom')
                         .tickPadding(8)
                         .ticks(8);

       var yAxis = d3.svg.axis()
                         .scale(y)
                         .orient('left')
                         .tickPadding(8)
                         .tickSize(0);

       var svg = d3.select(chart).append('svg')
                   .attr('width', width)
                   .attr('height', height)
                   .attr('class', 'chart')
                   .append('g')
                   .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

       var line = d3.svg.line()
                        .x(function(d) {return x(d.q)})
                        .y(function(d) {return y(d.p)})

       var area = d3.svg.area()
                        .interpolate("monotone")
                        .x(function(d) { return x(d.value); })
                        .y0(y(0))
                        .y1(function(d) { return y(d.height); });

       svg.append('path')
          .attr('class', 'summedarea')
          .attr("d", area(points))

       svg.selectAll('.chart')
          .data(data)
          .enter().append('circle')
          .attr('class', 'point')
          .attr('cx', function(d, i) { return x(d.value) })
          .attr('cy', y(0))
          .attr('r', 3);


       svg.append('g')
          .attr('class', 'x axis')
          .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
          .call(xAxis);

     }



     function drawSummedDistributionsWithResize(data, chart, height, stddev) {
       drawSummedDistributions(data, chart, height, stddev);
       $(window).resize(function() {drawSummedDistributions(data, chart, height, stddev); })
     };

     function drawHistogram(data, chart, height) {

       $(chart).empty();

       var x = d3.scale.linear()
                       .domain([0, 11])
                       .range([0, width - margin.left - margin.right]);

       var data = d3.layout.histogram()
                           .bins(x.ticks(10))(data);

       var y = d3.scale.linear()
                       .domain([0, d3.max(data, function(d) { return d.y; })])
                       .range([height - margin.top - margin.bottom, 0]);

       var xAxis = d3.svg.axis()
                         .scale(x)
                         .orient('bottom')
                         .tickPadding(8)
                         .ticks(8);

       var yAxis = d3.svg.axis()
                         .scale(y)
                         .orient('left')
                         .tickPadding(8)
                         .tickSize(0);

       var svg = d3.select(chart).append('svg')
                   .attr('width', width)
                   .attr('height', height)
                   .attr('class', 'chart')
                   .append('g')
                   .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

       var bar = svg.selectAll(".bar")
                    .data(data)
                    .enter().append("g")
                    .attr("class", "bar")
                    .attr("transform", function(d) { return "translate(" + x(d.x - 0.5) + "," + y(d.y) + ")"; });

       bar.append("rect")
          .attr("width", x(data[0].dx) - 3)
          .attr("height", function(d) {
            console.log(d + " " + y(d.y));
            return height - y(d.y) - margin.bottom - margin.top; });

       svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
          .call(xAxis);

       svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);


     }

     function drawHistogramWithResize(data, chart, height) {
       drawHistogram(data, chart, height);
       $(window).resize(function() {drawHistogram(data, chart, height); })
     };


</script>


I started digging into the history of mode detection after watching [Aysylu Greenberg](http://aysy.lu/)'s [Strange Loop talk on benchmarking](http://youtu.be/XmImGiVuJno).  She pointed out that the usual benchmarking statistics fail to capture that our timings may actually be samples from multiple distributions, commonly caused by the fact that our systems are comprised of hierarchical caches.

I thought it would be useful to add the detection of this to my favorite benchmarking tool, [Hugo Duncan](http://hugoduncan.org/)'s [Criterium](https://github.com/hugoduncan/criterium).  Not surprisingly, Hugo had already considered this and there's a note under the TODO section:

```
Multimodal distribution detection.
Use kernel density estimators?
```

I hadn't heard of using kernel density estimation for multimodal distribution detection so I found the original paper, [Using Kernel Density Estimates to Investigate Multimodality (Silverman, 1981)](http://www.stat.washington.edu/wxs/Stat593-s03/Literature/silverman-81a.pdf).  The original paper is a dense 3 pages and my goal with this post is to restate Silverman's method in a more accessible way.  Please excuse anything that seems overly obvious or pedantic and feel encouraged to suggest any modifications that would make it clearer.

## What is a mode?
The mode of a distribution is the value that has the highest probability of being observed.  Many of us were first exposed to the concept of a mode in a discrete setting.  We have a bunch of observations and the mode is just the observation value that occurs most frequently.  It's an elementary exercise in counting.  Unfortunately, this method of counting doesn't transfer well to observations sampled from a continuous distribution because we don't expect to ever observe the exact some value twice.

What we're really doing when we count the observations in the discrete case is estimating the [probability density function](http://en.wikipedia.org/wiki/Probability_density_function) (PDF) of the underlying distribution.  The value that has the highest probability of being observed is the one that is the global maximum of the PDF.  Looking at it this way, we can see that a necessary step for determining the mode in the continuous case is to first estimate the PDF of the underlying distribution.  We'll come back to how Silverman does this with a technique called kernel density estimation later.

## What does it mean to be multimodal?
In the discrete case, we can see that there might be undeniable multiple modes because the counts for two elements might be the same.  For instance, if we observe:

$$1,2,2,2,3,4,4,4,5$$

Both 2 and 4 occur thrice, so we have no choice but to say they are both modes.  But perhaps we observe something like this:

$$1,1,1,2,2,2,2,3,3,3,4,9,10,10$$

The value 2 occurs more than anything else, so it's *the* mode.  But let's look at the histogram:

<div id='hist'></div>
<script type='text/javascript'>
drawHistogramWithResize([1,1,1,2,2,2,2,3,3,3,4,9,10,10], '#hist', 300);
</script>
That pair of 10's are out there looking awfully interesting.  If these were benchmark timings, we might suspect there's a significant fraction of calls that go down some different execution path or fall back to a slower level of the cache hierarchy.  Counting alone isn't going to reveal the 10's because there are even more 1's and 3's.  Since they're nestled up right next to the 2's, we probably will assume that they are just part of the expected variance in performance of the same path that caused all those 2's.  *What we're really interested in is the local maxima of the PDF because they are the ones that indicate that our underlying distribution may actually be a mixture of several distributions.*

## Kernel density estimation
Imagine that we make 20 observations and see that they are distributed like this:
<div id='chart-1'></div>
<script type='text/javascript'>

  var data = [
{value: 13.1138}, {value: 10.6519}, {value: 20.5735}, {value: 7.89327}, {value: 9.02554}, {value: 20.8411}, {value: 8.84072}, {value: 10.6273}, {value: 13.5194}, {value: 17.9757}, {value: 10.1086}, {value: 8.68131}, {value: 7.16192}, {value: 19.9496}, {value: 8.77111}, {value: 19.5314}, {value: 9.40915}, {value: 12.8664}, {value: 23.1322}, {value: 13.5008}];
  drawPointsWithResize(data, '#chart-1', 90);
</script>

We can estimate the underlying PDF by using what is called a [kernel density estimate](http://en.wikipedia.org/wiki/Kernel_density_estimation).  We replace each observation with some distribution, called the "kernel," centered at the point.  Here's what it would look like using a normal distribution with standard deviation 1:

<div id='chart-2'></div>
<script type='text/javascript'>
    drawOverlappingDistributionsWithResize(data, '#chart-2', 200);
</script>

If we sum up all these overlapping distributions, we get a reasonable estimate for the underlying continuous PDF:

<div id='chart-3'></div>
<script type='text/javascript'>
     drawSummedDistributionsWithResize(data, '#chart-3', 300, 1);
</script>

Note that we made two interesting assumptions here:

1. We replaced each point with a normal distribution.  Silverman's approach actually relies on some of the nice mathematical properties of the normal distribution, so that's what we use.

2. We used a standard deviation of 1.  Each normal distribution is wholly specified by a mean and a standard deviation.  The mean is the observation we are replacing, but we had to pick some arbitrary standard deviation which defined the width of the kernel.

In the case of the normal distribution, we could just vary the standard deviation to adjust the width, but there is a more general way of stretching the kernel for arbitrary distributions.  The kernel density estimate for observations $X_1,X_2,...,X_n$ using a kernel function $K$ is:

$$\hat{f}(x)=\frac{1}{n}\sum\limits_{i=1}^n K(x-X_i)$$

In our case above, $K$ is the PDF for the normal distribution with standard deviation 1.  We can stretch the kernel by a factor of $h$ like this:

$$\hat{f}(x, h)=\frac{1}{nh}\sum\limits_{i=1}^n K(\frac{x-X_i}{h})$$

Note that changing $h$ has the exact same effect as changing the standard deviation: it makes the kernel wider and shorter while maintaining an area of 1 under the curve.

## Different kernel widths result in different mode counts
The width of the kernel is effectively a smoothing factor.  If we choose too large of a width, we just end up with one giant mound that is almost a perfect normal distribution.  Here's what it looks like if we use $h=5$:

<div id='chart-4'></div>
<script type='text/javascript'>
     drawSummedDistributionsWithResize(data, '#chart-4', 300, 5);
</script>

Clearly, this has a single maxima.

If we choose too small of a width, we get a very spiky and over-fit estimate of the PDF.  Here's what it looks like with $h = 0.1$:

<div id='chart-5'></div>
<script type='text/javascript'>
drawSummedDistributionsWithResize(data, '#chart-5', 300, 0.1);
</script>

This PDF has a bunch of local maxima.  If we shrink the width small enough, we'll get $n$ maxima, where $n$ is the number of observations:

<div id='chart-6'></div>
<script type='text/javascript'>
drawSummedDistributionsWithResize(data, '#chart-6', 300, 0.005);
</script>


The neat thing about using the normal distribution as our kernel is that it has the property that shrinking the width will only introduce new local maxima.  Silverman gives a proof of this at the end of Section 2 in the original paper.  This means that for every integer $k$, where $1<k<n$, we can find the minimum width $h_k$ such that the kernel density estimate has at most $k$ maxima.  Silverman calls these $h_k$ values "critical widths."

## Finding the critical widths
To actually find the critical widths, we need to look at the formula for the kernel density estimate.  The PDF for a plain old normal distribution with mean $\mu$ and standard deviation $\sigma$ is:

$$f(x)=\frac{1}{\sigma\sqrt{2\pi}}\mathrm{e}^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

The kernel density estimate with standard deviation $\sigma=1$ for observations $X_1,X_2,...,X_n$ and width $h$ is:

$$\hat{f}(x,h)=\frac{1}{nh}\sum\limits_{i=1}^n \frac{1}{\sqrt{2\pi}}\mathrm{e}^{-\frac{(x-X_i)^2}{2h^2}}$$

For a given $h$, you can find all the local maxima of $\hat{f}$ using your favorite numerical methods.  Now we need to find the $h_k$ where new local maxima are introduced.  Because of a result that Silverman proved at the end of section 2 in the paper, we know we can use a binary search over a range of $h$ values to find the critical widths at which new maxima show up.

## Picking which kernel width to use
This is the part of the original paper that I found to be the least clear.  It's pretty dense and makes a number of vague references to the application of techniques from other papers.

We now have a kernel density estimate of the PDF for each number of modes between $1$ and $n$.  For each estimate, we're going to use a statistical test to determine the significance.  We want to be parsimonious in our claims that there are additional modes, so we pick the smallest $k$ such that the significance measure of $h_k$ meets some threshold.

[Bootstrapping](http://en.wikipedia.org/wiki/Bootstrapping_(statistics\)) is used to evaluate the accuracy of a statistical measure by computing that statistic on observations that are [resampled](http://en.wikipedia.org/wiki/Resampling_(statistics\)) from the original set of observations.

Silverman used a [smoothed bootstrap procedure](http://en.wikipedia.org/wiki/Bootstrapping_(statistics\)#Smooth_bootstrap) to evaluate the significance.  Smoothed bootstrapping is bootstrapping with some noise added to the resampled observations.  First, we sample from the original set of observations, with replacement, to get $X_I(i)$.  Then we add noise to get our smoothed $y_i$ values:

$$y_i=\frac{1}{\sqrt{1+h_k^2/\sigma^2}}(X_{I(i)}+h_k \epsilon_i)$$

Where $\sigma$ is the standard deviation of $X_1,X_2,...,X_n$, $h_k$ is the critical width we are testing, and $\epsilon_i$ is a random value sampled from a normal distribution with mean 0 and standard deviation 1.

Once we have these smoothed values, we compute the kernel density estimate of them using $h_k$ and count the modes.  If this kernel density estimate doesn't have more than $k$ modes, we take that as a sign that we have a good critical width.  We repeat this many times and use the fraction of simulations where we didn't find more than $k$ modes as the p-value.  In the paper, Silverman does 100 rounds of simulation.

## Conclusion
Silverman's technique was a really important early step in multimodality detection and it has been thoroughly investigated and improved upon since 1981.  Google Scholar lists [about 670 citations of this paper](http://scholar.google.com/scholar?espv=2&bav=on.2,or.r_cp.r_qf.&bvm=bv.77161500,d.cGE&ion=1&biw=1680&bih=938&dpr=2&um=1&ie=UTF-8&lr=&cites=18163244822709704741).  If you're interested in learning more, one paper I found particularly helpful was [On the Calibration of Silverman's Test for Multimodality (Hall & York, 2001)](http://www3.stat.sinica.edu.tw/statistica/oldpdf/A11n28.pdf).

One of the biggest weaknesses in Silverman's technique is that the critical width is a global parameter, so it may run into trouble if our underlying distribution is a mixture of low and high variance component distributions.  For an actual implementation of mode detection in a benchmarking package, I'd consider using something that doesn't have this issue, like the technique described in [Nonparametric Testing of the Existence of Modes (Minnotte, 1997)](http://private.igf.edu.pl/~jnn/Literatura_tematu/Minnotte_1997.pdf).

I hope this is correct and helpful.  If I misinterpreted anything in the original paper, please let me know.  Thanks!
