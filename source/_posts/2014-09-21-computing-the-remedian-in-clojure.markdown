---
layout: post
title: "Computing the Remedian in Clojure"
date: 2014-09-29 09:03
comments: true
categories: clojure algorithms math
---
The remedian is an approximation of the [median](http://en.wikipedia.org/wiki/Median) that can be computed using only $O(\log{n})$ storage.  The algorithm was originally presented in [The Remedian: A Robust Averaging Method for Large Data Sets by Rousseeuw and Bassett](http://web.ipac.caltech.edu/staff/fmasci/home/statistics_refs/Remedian.pdf) (1990).  The core of it is on the first page:

> Let us assume that $n = b\^k$, where $b$ and $k$ are integers (the case where $n$ is not of this form will be treated in Sec. 7.  The _remedian_ with base $b$ proceeds by computing medians of groups of $b$ observations, yielding $b^{k-1}$ estimates on which this procedure is iterated, and so on, until only a single estimate remains.  When implemented properly, this method merely needs $k$ arrays of size $b$ that are continuously reused.

The implementation of this part in Clojure is so nice that I just had to share.

First, we need a vanilla implementation of the median function.  We're always going to be computing the median of sets of size $b$, where $b$ is relatively small, so there's no need to get fancy with a linear time algorithm.

```clojure
(defn median [coll]
  (let [size (count coll)
        sorted (sort coll)]
    (if (odd? size)
      (nth sorted (int (/ size 2)))
      (/ (+ (nth sorted (int (/ size 2)))
            (nth sorted (dec (int (/ size 2)))))
         2))))
```

Now we can implement the actual algorithm.  We group, compute the median of each group, and recur, with the base case being when we're left with a single element in the collection:

```clojure
(defn remedian [b coll]
  (if (next coll)
    (->> coll
         (partition-all b)
         (map median)
         (recur b))
    (first coll)))
```

Because `partition-all` and `map` both operate on and return lazy sequences, we maintain the property of only using $O(b \log_{b}{n})$ memory at any point in time.

While this implementation is simple and elegant, it only works if the size of the collection is a power of $b$.  If we don't have $n = b\^k$ where $b$ and $k$ are integers, we'll over-weight the observations that get grouped into the last groups of size $< b$.

Section 7 of the original paper describes the weighting scheme you should use to compute the median if you're left with incomplete groupings:

> How should we proceed when the sample size $n$ is less than $b\^k$? The remedian algorithm then ends up with $n_1$ numbers in the first array, $n_2$ numbers in the second array, and $n_k$ numbers in the last array, such that $n = n_1 + n_{2}b + ... + n_k b\^{k-1}$.  For our final estimate we then compute a weighted median in which the $n_1$, numbers in the first array have weight 1, the $n_2$ numbers in the second array have weight $b$, and the $n_k$ numbers in the last array have weight $b\^{k-1}$. This final computation does not need much storage because there are fewer than $bk$ numbers and they only have to be ranked in increasing order, after which their weights must be added until the sum is at least $n/2$.

It's a bit difficult to directly translate this to the recursive solution I gave above because in the final step we're going to do a computation on a mixture of values from the different recursive sequences.  Let's give it a shot.

We need some way of bubbling up the incomplete groups for the final weighted median computation.  Instead of having each recursive sequence *always* compute the median of each group, we can add a check to see if the group is smaller than $b$ and, if so, just return the incomplete group:

```clojure
(defn remedian-with-leftovers [b coll]
  (let [incomplete-group? #(or (< (count %) b)
                               (seq? (last %)))]
    (loop [coll coll]
      (if (next coll)
        (->> coll
             (partition-all b)
             (map #(if (incomplete-group? %) % (median %)))
             (recur))
        coll))))
```

For example, if we were using the mutable array implementation proposed in the original paper to compute the remedian of `(range 26)` with $b = 3$, the final state of the arrays would be:

Array  | $i_0$ | $i_1$   | $i_2$
-------|----|----|---
0      | 24 | 25 | _empty_
1      | 19 | 22 | _empty_
2      | 4  | 13 | _empty_
<br/>
In our sequence based solution, the final sequence will be `((4 13 (19 22 (24 25))))`.

Now, we need to convert these nested sequences into `[value weight]` pairs that could be fed into a weighted median function:

```clojure
(defn weight-leftovers [b nested-elements]
  (loop [vw-pairs []
         nested-elements nested-elements
         weight 1]
    (let [element (first nested-elements)]
      (cond
       (next nested-elements) (recur (conj vw-pairs [element weight])
                                     (next nested-elements)
                                     weight)
       (seq? element) (recur vw-pairs
                             element
                             (/ weight b))
       :else (conj vw-pairs [element weight])))))
```
Instead of weighting the values in array $j$ with weight $b\^{j-1}$, we're weighting it at $\frac{b\^{j-1}}{b\^{k}}$.  Dividing all the weights by a constant will give us the same result and this is slightly easier to compute recursively, as we can just start at 1 and divide by $b$ as we descend into each nested sequence.

If we run this on the `(range 26)` with $b = 3$, we get:

```clojure
user> (->> (range 26)
           (remedian-with-leftovers 3)
           (weight-leftovers 3))
[[4 1/3] [13 1/3] [19 1/9] [22 1/9] [24 1/27] [25 1/27]]
```

Finally, we're going to need a weighted median function.  This operates on a collection of `[value weight]` pairs:

```clojure
(defn weighted-median [vw-pairs]
  (let [total-weight (->> vw-pairs
                          (map second)
                          (reduce +))
        middle-weight (/ total-weight 2)
        sorted-pairs (sort-by first vw-pairs)
        sorted-pairs-cum-weight (reductions (fn [[_ cum-weight] [v w]]
                                              [v (+ cum-weight w)])
                                            sorted-pairs)]
    (->> sorted-pairs-cum-weight
         (filter #(<= middle-weight (second %)))
         (ffirst))))
```

We can put it all together and redefine the remedian function to deal with the case where $n$ isn't a power of $b$:

```clojure
(defn remedian [b coll]
  (->> coll
       (remedian-with-leftovers b)
       (weight-leftovers b)
       (weighted-median)))
```

The remedian is fun, but in practice I prefer to use the approximate quantile methods that were invented a few years later and presented in [Approximate Medians and other Quantiles in One Pass and with Limited Memory by Manku, Rajagopalan, and Lindsay](http://www.cs.umd.edu/~samir/498/manku.pdf) (1998).  There's a high-quality implementation you can use in Clojure via Java interop in Parallel Colt's [DoubleQuantileFinderFactory](http://incanter.org/docs/parallelcolt/api/cern/jet/stat/tdouble/quantile/DoubleQuantileFinderFactory.html).
