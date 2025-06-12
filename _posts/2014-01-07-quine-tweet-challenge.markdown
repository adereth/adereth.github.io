---
layout: post
title: Quine Tweet Challenge
date: 2014-01-08 7:49
comments: true
categories: mathematica clojure
---
A [quine](http://en.wikipedia.org/wiki/Quine_\(computing\)) is a program which takes no input and outputs a copy of its own source code.  There's a history of making challenges out of variants on the idea (shortest quine, [Ouroboros Programs](http://en.wikipedia.org/wiki/Quine_\(computing\)#Ouroboros_Programs), [Multiquines](http://en.wikipedia.org/wiki/Quine_\(computing\)#Multiquines)).  I'd like to propose a new variant for our modern social age: the Quine Tweet.

## Inspiration

Last year I was working through [4Clojure](http://www.4clojure.com/) and I had to reacquaint myself with how to implement one for [Problem #125: Gus's Quinundrum](http://www.4clojure.com/problem/125).

A few months later, I saw this tweet from [Gary Trakhman](https://twitter.com/gtrakGT):

<blockquote class="twitter-tweet" lang="en"><p>So simple!&#10;(defn send-tweet&#10;  [tweet]&#10;  (api/statuses-update :oauth-creds my-creds&#10;                       :params {:status tweet}))</p>&mdash; Gary Trakhman (@gtrakGT) <a href="https://twitter.com/gtrakGT/statuses/403227496352862208">November 20, 2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Seeing him tweet source code that tweets got me thinking about code that tweets its own source code.  Could a Quine Tweet be written?  I took a stab at adapting my Clojure code for Gus's Quinundrum, but I just couldn't make it fit in 140 characters.

## Enter Wolfram

The next day, this came across my dash:

<blockquote class="twitter-tweet" data-partner="tweetdeck"><p>Hello world! -- tweeting with <a href="https://twitter.com/search?q=%23wolframlang&amp;src=hash">#wolframlang</a> on <a href="https://twitter.com/Raspberry_Pi">@Raspberry_Pi</a> using Send[&quot;Twitter&quot;,&quot;Hello world!&quot; ...]</p>&mdash; Stephen Wolfram (@stephen_wolfram) <a href="https://twitter.com/stephen_wolfram/statuses/403600114247565312">November 21, 2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Maybe this will enable my impossible dream of a Quine Tweet...

I finally got a Raspberry Pi running with the Wolfram Language and I made it happen:

<blockquote class="twitter-tweet" data-partner="tweetdeck"><p>\{o, c\} = FromCharacterCode\[\{\{92, 40\}, \{92, 41\}\}\] ; SendMessage\[&quot;Twitter&quot;, StringReplace\[InString\[$Line\], \{o -&gt; &quot;&quot;, c -&gt; &quot;&quot;\}\]\]</p>&mdash; Matt Adereth (@adereth) <a href="https://twitter.com/adereth/statuses/420778395988135936">January 8, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

If you paste it into a notebook and evaluate, you'll get prompted for authorization and it'll post itself.  Here's a brief explanation of what it does:

1. [`$Line`](http://reference.wolfram.com/mathematica/ref/$Line.html) is the count of input expressions that have been evaluated.
2. [`InString`](http://reference.wolfram.com/mathematica/ref/InString.html) is a function that gets the input for the i^th input expression.  It returns a string that has some extra escaped parentheses.
3. 92 is the ASCII code for `\\`. 40 and 41 are the codes for `(` and `)`.  [`FromCharacterCode`](http://reference.wolfram.com/mathematica/ref/FromCharacterCode.html) can take a list of lists of ASCII codes and return a list of strings.  The list is destructured into the variables `o` (open) and `c` (close).
4. [`StringReplace`](http://reference.wolfram.com/mathematica/ref/StringReplace.html) is then used to clean up the extra parentheses.
5. `SendMessage` is the new function in the Wolfram language that does all the hard work of posting.

I don't think this is really in the true spirit of a quine, as having something like `InString` makes it a bit trivial, but you do what you must when you only have 140 characters!

## The Challenge

So, can it be done in any other languages?  Here's what I think are fair restrictions:

1. Any standard Twitter client library for your language can be linked using the language's normal methods (pom.xml, project.clj, etc.)
2. The authorization token can be supplied outside of source, either interactively or through a text file.  I don't imagine anyone wants to be sharing that...

Bonus points if you manage to make the tweet and source include `#quine`!