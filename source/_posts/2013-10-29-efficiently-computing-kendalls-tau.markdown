---
layout: post
title: "Efficiently Computing Kendall's Tau"
date: 2013-10-30 21:45
comments: true
categories: clojure algorithms
---
Typically when people talk about correlation they are referring to the [Pearson's product-moment coefficient](http://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient):

$$\rho_{X,Y}={E[(X-\mu_X)(Y-\mu_Y)] \over \sigma_X\sigma_Y}$$

The Pearson coefficient is 1 if the datasets have a perfectly positive linear relationship and -1 if they have a perfectly negative linear relationship.  But what if our data has a clear positive relationship, but it's not linear?  Or what if our data isn't even numeric and doesn't have a meaningful way of computing the average, $\mu$, or standard deviation, $\sigma$?

In these cases, Kendall's Tau is a useful way of measuring the correlation since it only requires that we have a [total ordering](http://en.wikipedia.org/wiki/Total_order) for each of our datasets.  For each pair of observations, $(x_1, y_1)$ and $(x_2, y_2)$, we call the pair _concordant_ if:
$$x_1 < x_2 \text{ and } y_1 < y_2$$
$$\text{or}$$
$$x_1 > x_2 \text{ and } y_1 > y_2$$
...and we call the pair _discordant_ if:
$$x_1 < x_2 \text{ and } y_1 > y_2$$
$$\text{or}$$
$$x_1 > x_2 \text{ and } y_1 < y_2$$
If $x_1 = x_2 \text{ or } y_1 = y_2$, the pair is neither concordant nor discordant.  

Kendall's Tau is then defined as:
$$\tau = \frac{n_c-n_d}{\frac{1}{2} n (n-1) }$$
Where $n_c$ is the number of concordant pairs and $n_d$ is the number of discordant pairs.
Since $n (n-1) / 2$ is the total number of pairs, this value ranges from -1 to 1.

Unfortunately, this approach doesn't deal well with tied values.  Consider the following set of $(x,y)$ observations:
$$(1,1), (1,1), (2,2), (3,3)$$
There's a perfectly positive linear relationship between X and Y, but only 5 of the 6 pairs are concordant.  For this case we want to use the $\tau_B$ modified version:

$$\tau_B = \frac{n_c-n_d}{\sqrt{(n_0-n_1)(n_0-n_2)}}$$

...where:

$$n_0 = n(n-1)/2$$
$$n_1 = \text{Number of pairs with tied values in } X$$
$$n_2 = \text{Number of pairs with tied values in } Y$$

## Computing Naively
We can compute $\tau_B$ in $O(n^{2})$ by looking at every pair of observations and tallying the number of concordant, discordant, and tied pairs.  Once we have the tallies, we'll apply the formula:
```clojure
(defn kendalls-tau-from-tallies
  [{:keys [concordant discordant pairs x-ties y-ties]}]
  (/ (- concordant discordant)
     (Math/sqrt (* (- pairs x-ties)
                   (- pairs y-ties)))))
```

For a given pair of observations, we'll construct a map describing which tallies it will contribute to:
```clojure
(defn kendall-relations [[[x1 y1] [x2 y2]]]
  (cond
   (and (= x1 x2) (= y1 y2)) {:x-ties 1 :y-ties 1}
   (= x1 x2) {:x-ties 1}
   (= y1 y2) {:y-ties 1}
   (or (and (< x1 x2) (< y1 y2))
       (and (> x1 x2) (> y1 y2))) {:concordant 1}
   :else {:discordant 1}))
```

Now we need a way of generating every pair:
```clojure
(defn pairs [[o & more]]
  (if (nil? o) nil
      (concat (map #(vector o %) more)
              (lazy-seq (pairs more)))))

;; (pairs [1 2 3 4])
;; => ([1 2] [1 3] [1 4] [2 3] [2 4] [3 4])
```
Finally, we put it all together by computing the relations tally for each pair and combining them using `merge-with`:
```clojure
(defn naive-kendalls-tau [xs ys]
  (let [observations (map vector xs ys)
        relations (map kendall-relations (pairs observations))
        tallies (reduce (partial merge-with +
                                 {:pairs 1})
                        {:concordant 0 :discordant 0
                         :x-ties 0 :y-ties 0 :pairs 0}
                        relations)]
    (kendalls-tau-from-tallies tallies)))
```

## Knight's Algorithm
In 1966, William R. Knight was a visiting statistician at the Fisheries Research Board of Canada.  He wrote:

> The problem of calculating Kendall's tau arose while attempting to evaluate species associations in catches by the Canadian east coast offshore fishery.  Sample sizes ranging up to 400 were common, making manual calculations out of the question; indeed, an initial program using an asymptotically inefficient method proved expensively slow.

Necessity is the mother of invention, and he came up with a clever algorithm for computing Kendall's Tau in $O(n \log{n})$ which he published in his paper entitled "[A Computer Method for Calculating Kendall's Tau with Ungrouped Data](http://www.jstor.org/stable/2282833)".

First, sort the observations by their $x$ values using your favorite $O(n \log{n})$ algorithm.  Next, sort *that* sorted list by the $y$ values using a slightly modified [merge sort](http://en.wikipedia.org/wiki/Merge_sort) that keeps track of the size of the swaps it had to perform.

Recall that merge sort works as follows:

1. Divide the unsorted list into $n$ sublists, each containing 1 element (a list of 1 element is considered sorted).
2. Repeatedly merge sublists to produce new sublists until there is only 1 sublist remaining. This will be the sorted list.

{% img center  http://upload.wikimedia.org/wikipedia/commons/c/cc/Merge-sort-example-300px.gif Merge Sort Animation %}
*(description and animation from [Wikipedia](http://en.wikipedia.org/wiki/Merge_sort))*

The trick is performed when merging sublists.  The list was originally sorted by $x$ values, so whenever an element from the second sublist is smaller than the next element from the first sublist we know that the corresponding observation is discordant with however many elements remain in the first sublist.

We can implement this modified merge sort by first handling the case of merging two sorted sequences:

```clojure
(defn merge-two-sorted-seqs-and-count-discords
  "Takes a sequence containing two sorted sequences and merges them.  If an
element from the second sequence is less than the head of the first sequence, we
know that it was discordant with all the elements remaining in the first
sequence.  This is the insight that allows us to avoid the O(n^2) comparisons in
the naive algorithm.

A tuple containing the count of discords and the merged sequence is returned."
  [[coll1 coll2]]
  (loop [swaps 0

         ;; Explicitly track the remaining counts to avoid doing a linear
         ;; scan of the sequence each time, which would get us back to O(n^2)
         remaining-i (count coll1)
         remaining-j (count coll2)
         
         [i & rest-i :as all-i] coll1
         [j & rest-j :as all-j] coll2
         result []]
    (cond
     (zero? remaining-j) [swaps (concat result all-i)]
     (zero? remaining-i) [swaps (concat result all-j)]
     (<= i j) (recur swaps
                     (dec remaining-i) remaining-j
                     rest-i all-j (conj result i))
     :j>i (recur (+ swaps remaining-i)
                  remaining-i (dec remaining-j)
                  all-i rest-j (conj result j)))))
```
Now, we can do the full merge sort by applying that function to piece sizes that double until the whole collection is covered by a single sorted piece:
```clojure
(defn merge-sort-and-count-discords
  "Returns a vector containing the number of discordant swaps and the sorted
collection."
  [coll]
  (loop [swaps 0
         coll coll
         piece-size 1]
    (let [pieces (partition-all piece-size coll)
          piece-pairs (partition-all 2 pieces)]
      (if (-> piece-pairs first second)
        (let [[new-swaps new-coll]
              (->> piece-pairs
                   (map merge-two-sorted-seqs-and-count-discords)
                   (reduce (fn [[acc-s acc-c] [s c]]
                             [(+ acc-s s) (concat acc-c c)])
                           [0 []]))]
          (recur (+ swaps new-swaps) new-coll (* 2 piece-size)))
        [swaps coll]))))
```

The only thing we are missing now is the tallies of tied pairs.  We could use [`clojure.core/frequencies`](http://clojuredocs.org/clojure_core/clojure.core/frequencies), but Knight's original paper alludes to a different way which takes advantage of the fact that at different stages of the algorithm we have the list sorted by $X$ and then $Y$.  Most implementations do something like:

```clojure
(defn tied-pair-count [sorted-coll]
  (->> sorted-coll
       (partition-by identity)
       (map count)
       (map #(/ (* % (dec %)) 2))
       (reduce +)))
```

Now we have all the pieces, so we just have to put them together:

```clojure
(defn knights-kendalls-tau [xs ys]
  (let [observations (sort (map vector xs ys))
        n (count observations)
        pair-count (/ (* n (dec n)) 2)
        xy-pair-ties (tied-pair-count observations)
        x-pair-ties (tied-pair-count (map first observations))
        [swaps sorted-ys] (merge-sort-and-count-discords
                           (map second observations))
        y-pair-ties (tied-pair-count sorted-ys)
        concordant-minus-discordant (- pair-count
                                       x-pair-ties
                                       y-pair-ties
                                       (- xy-pair-ties)
                                       (* 2 swaps))]
    (/ concordant-minus-discordant
       (Math/sqrt (* (- pair-count x-pair-ties)
                     (- pair-count y-pair-ties))))))
```

## Conclusion
There are certainly many things I would write differently above if I was really trying for performance.  The goal here was to clearly illustrate the algorithm and maintain the asymptotic run-time characteristics.

Also, I recently submitted [a patch](https://issues.apache.org/jira/browse/MATH-814) to the Apache Commons Math library that contains an implementation of this in pure Java if that's your thing.

I think this algorithm is a clever little gem and I really enjoyed learning it.  Deconstructing a familiar algorithm like merge sort and utilizing its internal operations for some other purpose is a neat approach that I'll definitely keep in my algorithmic toolbox.