---
layout: post
title: Typing Qwerty on a Dvorak Keyboard
date: 2014-08-14 18:40
comments: true
categories: mathematica keyboards math
---
[@thattommyhall](https://twitter.com/thattommyhall) posted a fun question on Twitter:

<blockquote><p>If you type your name on a keyboard marked as qwerty but set to Dvorak and keep reinputting what comes out, will it ever say your name?</p>&mdash; !!!!!11111oneoneone (@thattommyhall) <a href="https://twitter.com/thattommyhall/statuses/494916131598393344">July 31, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

The best answer was "yes because group theory" and [@AnnaPawlicka](https://twitter.com/AnnaPawlicka) demonstrated it was true for her name:
<blockquote class="twitter-tweet" lang="en"><p><a href="https://twitter.com/thattommyhall">@thattommyhall</a> Yes. I can confirm that. :) <a href="http://t.co/Vubkf1ltoK">pic.twitter.com/Vubkf1ltoK</a></p>&mdash; Anna Pawlicka (@AnnaPawlicka) <a href="https://twitter.com/AnnaPawlicka/statuses/494918999747350529">July 31, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

But is it really true?  And if so, how many iterations will it take to get the target string?  I turned to Mathematica...

```clojure
qwerty =
  {"-", "=",
   "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\",
   "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'",
   "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"};
dvorak =
  {"[", "]",
   "'", ",", ".", "p", "y", "f", "g", "c", "r", "l", "/", "=", "\\",
   "a", "o", "e", "u", "i", "d", "h", "t", "n", "s", "-",
   ";", "q", "j", "k", "x", "b", "m", "w", "v", "z"};
```

```clojure
KeyGraph[from_, to_] :=
 Graph[
  MapThread[#1 -> #2 &, {from, to}],
  VertexLabels -> "Name", DirectedEdges -> True]
```

This allows us to visualize the mapping of keys from one layout to another:

```clojure
KeyGraph[dvorak, qwerty]
```
![Dvorak to Qwerty Graph](/images/dvorak-qwerty.png)

There is a single directed edge going from each character to the one that will be displayed when you type it.  There are 3 keys that remain unchanged, 2 pairs of swapped keys, and 2 large cycles of keys.

We can get these groups programmatically using the [ConnectedComponents function](http://reference.wolfram.com/mathematica/ref/ConnectedComponents.html):

```clojure
TableForm @
 Sort @
  ConnectedComponents @
   KeyGraph[dvorak, qwerty]
```

``` Output lang:text %}
\
a
m
] =
, w
. e y t f g u c i d h j k v
[ - ' q p r o l / s n ; z x b
``` %}

It will take the length of the cycle the letter is in to get the letter we want.  For a given word, we won't get all the letters we want unless we've iterated some multiple of the length of the cycles each letter is in.  Let's apply the Least Common Multiple function to see the worst case where there is a letter from each cycle:

```clojure
LCM @@
 Length /@
  ConnectedComponents @
   KeyGraph[dvorak, qwerty]
```
``` Output lang:text %}
210
``` %}

Looks like Anna got lucky that her name only consists of letters in a cycle of length 1 and 15.

For fun, here's the graph we get if we use Colemak instead of Dvorak:

```clojure
colemak =
  {"-", "=",
   "q", "w", "f", "p", "g", "j", "l", "u", "y", ";", "[", "]", "\\",
   "a", "r", "s", "t", "d", "h", "n", "e", "i", "o", "'",
   "z", "x", "c", "v", "b", "k", "m", ",", ".", "/"};

KeyGraph[colemak, qwerty]
```
![Colemak to Qwerty Graph](/images/colemak-qwerty.png)

One cycle of length 14, one cycle of length 3, and the rest are just letters that map back to themselves.

```clojure
LCM @@
 Length /@
  ConnectedComponents @
   KeyGraph[colemak, qwerty]
```
``` Output lang:text %}
42
``` %}
