---
layout: post
title: Comparing Programming Font Pairs
date: 2011-01-26 22:46
comments: true
categories: fonts mathematica
---
I really like this visualization of the difference between Deja Vu Sans Mono and Apple Menlo:

![Menlo vs. Deja Vu Sans Mono](http://typophile.com/files/menlovsdejavusansmono_6131.png)

(Credit to [Jesse Burgheimer](http://www.down10.com))

I decided to take a stab at programmatically generating a similar comparison for all the fonts I’ve been looking at.  [Here’s the Mathematica code](/assets/paircompare.nb).

[![Menlo vs. Deja Vu Sans Mono in Mathematica](images/dejavusansmonodroidsansmono.png)](images/dejavusansmonodroidsansmono.png)
(Click for full size version)

It was then easy to generate this for every pair of fonts:

![CompareFontPair /@ Subsets[monospacedFonts, {2}]](/images/MapCompareFontPair.png)

I went through them all and picked out the ones I thought were most interesting:

[![consolasinconsolata](/images/consolasinconsolata.png)](/images/consolasinconsolata.png)
[![dejavusansmonodroidsansmono](/images/dejavusansmonodroidsansmono.png)](/images/dejavusansmonodroidsansmono.png)
[![dejavusansmonopanicsans](/images/dejavusansmonopanicsans.png)](/images/dejavusansmonopanicsans.png)
[![droidsansmonoinconsolata](/images/droidsansmonoinconsolata.png)](/images/droidsansmonoinconsolata.png)
[![envycoderterminus](/images/envycoderterminus.png)](/images/envycoderterminus.png)
[![inconsolatamonofur](/images/inconsolatamonofur.png)](/images/inconsolatamonofur.png)

If you’re interested in seeing the results for every pair, you can [download them all](https://s3.amazonaws.com/1overBlog/programming_fonts/AllFontPairComparisons.zip).