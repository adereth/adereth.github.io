---
layout: post
title: "unicode-math 0.2.0 released"
date: 2013-10-13 14:28
comments: true
categories: clojure unicode math
---
I just deployed a new version of [unicode-math](https://github.com/adereth/unicode-math) to Clojars.  It's a silly toy project that implements as many of [Unicode's math symbols](http://symbolcodes.tlt.psu.edu/bylanguage/mathchart.html) as possible in Clojure.  If you `use` it, you can write things like:

[Binet's Fibonacci Number Formula](http://mathworld.wolfram.com/BinetsFibonacciNumberFormula.html):
```clojure
(defn binet-fib [n]
  (/ (- (ⁿ φ n)
        (ⁿ (- φ) (- n)))
     (√ 5)))
```
[de Morgan's Laws](http://mathworld.wolfram.com/deMorgansLaws.html):
```clojure
(assert (∀ [p [true false] q [true false]]
             (= (¬ (∧ p q))
                (∨ (¬ p) (¬ q)))))
```

[Inclusion-Exclusion Principle](http://mathworld.wolfram.com/Inclusion-ExclusionPrinciple.html):
```clojure
(assert (= (count (∪ A B))
           (+ (count A)
              (count B)
              (- (count (∩ A B))))))
```
Instructions for use are on the [project's Github page](https://github.com/adereth/unicode-math).  The full list of implemented symbols is in [src/unicode_math/core.clj](https://github.com/adereth/unicode-math/blob/master/src/unicode_math/core.clj).
