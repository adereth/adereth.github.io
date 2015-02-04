---
layout: post
title: "core.matrix + Apache Commons Math"
date: 2013-11-08 08:08
comments: true
categories: clojure math
---
I'd like to share a little project I did to make it more convenient to use Apache Commons Math's linear algebra classes with Clojure.

## Apache Commons Math
![Apache Commons Math Logo](/images/acm.gif)

[Apache Commons Math](http://commons.apache.org/proper/commons-math/index.html) is a Java library of mathematics and statistics components.  It's loaded with useful things including:

- Statistics
- Data Generation
- Probability Distributions
- Machine Learning
- Optimization
- Numerical Analysis
- Curve Fitting
- Linear Algebra
- Complex Numbers
- Ordinary Differential Equations

I highly recommend at least skimming the [User Guide](http://commons.apache.org/proper/commons-math/userguide/index.html).  It's useful to know what's already available and you may even discover a branch of mathematics that you find interesting.

As with most Java libraries, it's generally pleasant to use from Clojure via interop.  Of course, there are a few places where there's unnecessary object constructiion just to get at methods that could easily be static and there are a few others where *mutation* rears its ugly head.  For the non-static cases, it's trivial enough to create a `fn` that creates the object and calls the method you need.

Many of the methods in the library either accept or return matrices and vectors, using the [RealMatrix](http://commons.apache.org/proper/commons-math/apidocs/org/apache/commons/math3/linear/RealMatrix.html) and [RealVector](http://commons.apache.org/proper/commons-math/apidocs/org/apache/commons/math3/linear/RealVector.html) interfaces.  While we could use interop to create and use these, it's nice to be able to use them in idiomatic Clojure and even nicer to be able to seamlessly use them with pure Clojure data structures.

## core.matrix
[core.matrix](https://github.com/mikera/core.matrix) is a library and API that aims to make matrix and array programming idiomatic, elegant and fast in Clojure.  It features pluggable support for different underlying matrix library implementations.

For all my examples, I've included core.matrix as `m`:
```clojure
(require '[clojure.core.matrix :as m])
```

## apache-commons-matrix
After implementing a few protocols, I was able to get full support for Apache Commons Math's matrices and vectors into the core.matrix API, which I've released as [adereth/apache-commons-matrix](https://github.com/adereth/apache-commons-matrix).

Once you've loaded `apache-commons-matrix.core`, you can begin using the `core.matrix` functions on any combination of Apache Commons Math matrices and vectors and any other implementation of matrix and vectors, including Clojure's built-in persistent vectors.

Without this, you have to write some pretty cumbersome array manipulation code to get the interop to work.  For instance:
```clojure
(org.apache.commons.math3.linear.Array2DRowRealMatrix.
 (into-array [(double-array [1 1])
              (double-array [1 0])]))
;; #<Array2DRowRealMatrix Array2DRowRealMatrix{ {1.0,1.0}, {1.0,0.0} }>
```

...versus:

```clojure
(m/with-implementation :apache-commons
  (m/matrix [[1 1] [1 0]]))
;; #<Array2DRowRealMatrix Array2DRowRealMatrix{ {1.0,1.0}, {1.0,0.0} }>
```

If you're working from the REPL or otherwise don't care about indirectly changing the behavior of your code, you could even avoid `with-implementation` and just make `:apache-commons` the default by evaluating:
```clojure
(m/set-current-implementation :apache-commons)
```

Things become really convenient when you start combining Apache Commons Math data structures with Clojure's.  For example, we can multiply a `RealMatrix` and a vector:

```clojure
(def fib-matrix
  (m/with-implementation :apache-commons
    (m/matrix [[1 1] [1 0]])))

(m/transform fib-matrix [5 3])
;; #<ArrayRealVector {8; 5}>
```

Note that the type of the result depends on the implementation of the first parameter:

```clojure
(def fib-vector
    (m/with-implementation :apache-commons
      (m/array [5 3])))
;; #<ArrayRealVector {5; 3}>

(m/transform [[1 1] [1 0]] fib-vector)
;; [8.0 5.0]
```

## Implementation Experience
It was really easy to follow the [Implementation Guide for core.matrix](https://github.com/mikera/core.matrix/wiki/Implementation-Guide) that Mike Anderson wrote.  There were just a handful of protocols that I needed to implement and I magically got all the functionality of core.matrix.  The test framework is incredibly thorough and it immediately revealed a number of subtle bugs in my initial implementation.  Overall, it was a great experience and I wish that all interfaces provided such nice documentation and testing.

## Conclusion
If you're doing any math on the JVM, you should at least check out what Apache Commons Math has to offer.  If you're using it in Clojure, I recommend using core.matrix instead of interop whenever possible.  If you do try this out, please let me know if there's anything missing or just send me a pull request!
