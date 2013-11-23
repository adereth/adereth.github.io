---
layout: post
title: "A few interesting Clojure microbenchmarks"
date: 2013-11-22 7:50
comments: true
categories: clojure
---

<script src="http://d3js.org/d3.v2.js"></script> 
<!--       font-family: Arial, sans-serif; "Menlo","Monaco","Andale Mono","lucida console","Courier New",monospace;-->
<!-- CSS Styles: -->
<div>
  <style type="text/css">

    .chart {
      font-family: monospace;
      font-size: 10px;
      margin-top: -40px;
    }

    .bar {
      fill: grey;
    }

    .axis path, .axis line {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
    }

  </style>
</div>

<!-- Global Variables and Handlers: -->
<script type="text/javascript">

  var margin = {top: 40, right: 40, bottom: 60, left: 110},
      width = $('.entry-content').width();

  $(window).resize(function() {
    width = $('.entry-content').width();
  });

  function draw(data, chart, height) {
    
    $(chart).empty();

    var x = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.mean})])
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
	.enter().append('rect')
        .attr('class', 'bar')
        .attr('y', function(d, i) { return y(i) })
        .attr('width', function(d) { return x(d.mean) })
        .attr('height', y.rangeBand());

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + y.rangeExtent()[1] + ')')
        .call(xAxis);

    svg.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "end")
    	.attr("x", width / 2 - 45)
    	.attr("y", height - 60)
    	.text("nanoseconds");

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .selectAll('text')
        .text(function(d) { return data[d].code; });
    
  }
  
  function drawWithResize(data, chart, height) {
    draw(data, chart, height);
    $(window).resize(function() {draw(data, chart, height); })
  }
;


</script>


[Zach Tellman](http://ideolalia.com/) delivered a really informative and practical unsession at [Clojure Conj 2013](http://clojure-conj.org/) entitled "Predictably Fast Clojure."  It was described as:
> An exploration of some of the underlying mechanisms in Clojure, and how to build an intuition for how fast your code should run. Time permitting, we'll also explore how to work around these mechanisms, and exploit the full power of the JVM.

I'd like to share a few interesting things that I learned from this talk and that I subsequently verified and explored.

## How to benchmark
It turns out that benchmarking is hard and benchmarking on the JVM is even harder.  Fortunately, the folks at the Elliptic Group have thought long and hard about how to do it right and have written [a couple of great articles](http://www.ibm.com/developerworks/views/java/libraryview.jsp?search_by=robust+java+benchmarking) on the matter.  Hugo Duncan's [Criterium library](https://github.com/hugoduncan/criterium) makes it super easy to use these robust techniques.

All the benchmarks in this post were run on my dual-core 2.6 GHz Intel Core i5 laptop.  The JVM was started with `lein with-profile production repl`, which enables more aggressive JIT action at the cost of slower start times.  If you try to use Criterium without this, you'll get warnings spewed for every benchmark you run.

## Surprising operations on lists, vectors, and tuples
The first thing that he discussed was the relatively poor performance of `first` on vectors.

For the tests, I made the some simple collections:
```clojure
(def ve [0 1 2])
(def li '(0 1 2))
(def tu (clj-tuple/tuple 0 1 2))
```

And then I timed them each with `first` and `(nth coll 0)`:

<div id='chart-1'></div>
<script type='text/javascript'>
  var data = [
      {code: "(first ve)", mean: 59.387551, lower: 56.557346, upper: 75.434730},
      {code: "(first li)", mean: 11.814687, lower: 9.933760, upper: 17.651180},
      {code: "(first tu)", mean: 12.026005, lower: 11.096498, upper: 17.716830},
      {code: "(nth ve 0)", mean: 14.507457, lower: 13.379794, upper: 19.732508},
      {code: "(nth li 0)", mean: 132.042247, lower: 123.849601, upper: 173.395438},
      {code: "(nth tu 0)", mean: 11.240653, lower: 10.739338, upper: 12.333350},
      ];
  data.reverse();
  drawWithResize(data, '#chart-1', 275);
</script>

The [documentation](http://clojuredocs.org/clojure_core/clojure.core/first) says that `first` "calls seq on its argument."  This is effectively true, but if you look at the [source](https://github.com/clojure/clojure/blob/1.5.x/src/jvm/clojure/lang/RT.java#L575) you'll see that if the collection implements `ISeq`, `seq` doesn't need to be called.  As a result, the performance of `first` on lists, which do implement `ISeq`, is much better than on vectors, which don't.  Zach took advantage of this observation in his [clj-tuple](https://github.com/ztellman/clj-tuple) library and made sure that tuples implement `ISeq`.

What's really interesting is that you can use `(nth coll 0)` to get the first element of a vector faster that you can with `first`.  Unfortunately, this only does well with vectors.  The performance is abysmal when applied to lists, so you should stick to `first` if you don't know the data structure you are operating on.

The apparent slowness of `seq` on a vector made me wonder about the `empty?` function, which uses `seq` under the hood:

```clojure
user=> (source empty?)
(defn empty?
  "Returns true if coll has no items - same as (not (seq coll)).
  Please use the idiom (seq x) rather than (not (empty? x))"
  {:added "1.0"
   :static true}
  [coll] (not (seq coll)))
```

If using `seq` is so slow, perhaps we can get better performance by just getting the count of elements and testing if it's zero:

<div id='chart-empty'></div>
<script type='text/javascript'>
  var dataE = [
{code: "(empty? ve)", mean: 22.436542, lower: 22.052842, upper: 23.003189},
{code: "(empty? li)", mean: 12.293540, lower: 11.680523, upper: 15.369996},
{code: "(empty? tu)", mean: 18.512765, lower: 17.351246, upper: 22.757244},
{code: "(= 0 (count ve))", mean: 11.209652, lower: 10.451370, upper: 15.123089},
{code: "(= 0 (count li))", mean: 10.710336, lower: 10.417919, upper: 11.667121},
{code: "(= 0 (count tu))", mean: 10.741061, lower: 10.396224, upper: 13.246183},
      ];
  dataE.reverse();
  drawWithResize(dataE, '#chart-empty', 275);
</script>

Of course, this is a bad idea for lazy sequences and should probably be avoided, as we'll incur a cost that is linear in the size of the sequence just to get the count.

I don't think this will affect my day to day code, but it certainly is interesting and surfaced a bit more about how things actually work in Clojure.

## Inconsistent protocol timings
This was a surprising one that also peeled back a layer on Clojure's implementation.  In Fogus's [Why Clojure might not need invokedynamic, but it might be nice](http://blog.fogus.me/2011/10/14/why-clojure-doesnt-need-invokedynamic-but-it-might-be-nice/), he explained:

> Clojure's protocols are polymorphic on the type of the first argument. The protocol functions are call-site cached (with no per-call lookup cost if the target class remains stable). In other words, the implementation of Clojure's protocols are built on polymorphic inline caches.

The consequence of this is that we will see worse performance if the type of the first argument to a protocol's method keeps changing.  I made a simple test to see how significant this is:

```clojure
(defprotocol P
  (f [x]))

(extend-protocol P
  String (f [_] 1)
  Long (f [_] 2))

(defn g [x y]
  (+ (f x) (f y)))

(def s0 "foo")
(def s1 "bar")
(def n0 0)
(def n1 1)
```

`g` calls `f` on both its arguments and we expect `f` to perform best when it's consistently called on a single type:

<div id='chart-2'></div>
<script type='text/javascript'>
  var data2 = [
{code: "(g n0 n1)", mean: 21.597699},
{code: "(g s0 s1)", mean: 22.550262},
{code: "(g n0 s0)", mean: 37.527409}
      ];
  data2.reverse();
  drawWithResize(data2, '#chart-2', 190);
</script>

The expectation was correct.  There was some subsequent talk about whether the penalty of this cache miss was predictable.  Theoretically, the cost could be unbounded if you extend the protocol with enough types and have horrible luck with the hash codes of those types colliding, but my understanding of the caching logic is that it will usually be the small constant that we observed here.

You can see why by taking a look at how the cache works in [MethodImplCache.java](https://github.com/clojure/clojure/blob/1.5.x/src/jvm/clojure/lang/MethodImplCache.java#L76).  The hash code of the class is shifted and masked by values that form a simple perfect hash, which is determined by the [`maybe-min-hash` function](https://github.com/clojure/clojure/blob/1.5.x/src/clj/clojure/core.clj#L5971).  The use of a perfect hash means that we should see consistent lookup times for even moderately large caches.

In the rare case that a perfect hash can't be found by `maybe-min-hash`, the cache falls back to using a `PersistentArrayMap`, which can have slightly worse performance.  In any case, I don't think there's much to worry about here.

One neat thing I discovered while testing all of this is that you don't suffer this cache-miss penalty if you declare that you support a protocol in your `deftype` or if you `reify`, but you do if you use `extend-protocol`:

```clojure
(deftype X []
  P
  (f [_] 3))
(def dt (X.))

(def re (reify P (f [_] 4)))

(deftype Y [])
(extend-protocol P
  Y
  (f [_] 5))
(def ep (Y.))
```

<div id='chart-3'></div>
<script type='text/javascript'>
  var data3 = [
      {code: "(g s0 dt)", mean: 19.389459},
      {code: "(g s0 re)", mean: 19.747690},
      {code: "(g s0 ep)", mean: 76.890915},
      ];
  data3.reverse();
  drawWithResize(data3, '#chart-3', 190);
</script>

My understanding is that the declaration of a protocol results in the creation of function objects and in a corresponding interface.  When the function is called, the first thing it does when trying to dispatch is see if the first argument implements the interface for the protocol that declared the function in the first place.  If it did, the corresponding method on the object is called.  If it doesn't implement the interface, it next uses the MethodImplCache and has the potential to suffer from the cache miss.  What's great is that if the object does implement the interface, the most recent entry in the cache is unaffected.

We can verify that the reified object and the instance of the type that was deftyped with the protocol both implement the interface and the other one doesn't:

```clojure
user=> (supers (type dt))
#{user.P clojure.lang.IType java.lang.Object}

user=> (supers (type re))
#{clojure.lang.IObj user.P java.lang.Object clojure.lang.IMeta}

user=> (supers (type ep))
#{clojure.lang.IType java.lang.Object}
```

## Determining if your type hints worked
Often when we want to squeeze every last bit of performance, we use type hints to avoid reflection and to force the use of primitives.  Zach demonstrated how to use Gary Trakhman's [no.disassemble](https://github.com/gtrak/no.disassemble) to inspect the byte code of a function directly from the REPL.

I haven't gotten to play with it yet, but the ability to quickly compare the byte code between two implementations in the REPL looked amazing.

## Thanks
Thanks to Zach Tellman for the informative presentation that motivated this and to David Greenberg for help investigating the protocol performance issues.

If there's anything I got wrong, please let me know in the comments... thanks!