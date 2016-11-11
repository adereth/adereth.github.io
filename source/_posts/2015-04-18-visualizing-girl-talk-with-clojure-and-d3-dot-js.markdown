---
layout: post
title: "Visualizing Girl Talk: Parsing with Clojure's Instaparse"
date: 2016-1-20 06:10
comments: true
categories: clojure d3
---
Greg Gillis, also known as Girl Talk, is an impressive DJ who creates mega-mashups consisting of hundreds of samples.  His sample selections span 7 decades and dozens of genres.  Listening to his albums is a bit like having a concentrated dump of music history injected right into your brain.

![Neo: "I know pop culture"](/images/popculture.png)

I became a little obsessed with his work last year and I wanted a better way to experience his albums, so I created an annotated player using Clojure and d3 that shows relevant data and links about every track as it plays:

[![Image of player](/images/girltalkplayer.png)](http://adereth.github.io/oneoff/girltalk-v2/)

I have versions of this player for his two most recent albums:

- [All Day](http://adereth.github.io/oneoff/girltalk-v2/)
- [Feed The Animals](http://adereth.github.io/oneoff/girltalk-v2/fta.html)

Unfortunately, they only really work on the desktop right now.

## Parsing Track Data

I've released [all the code](http://github.com/adereth/girltalk-visualization) that I used to collect the data and to generate the visualizations, but in this post I'm just going to talk about the first stage of the process: getting the details of which tracks were sampled at each time.

There's an excellent (totally legal!) crowd-sourced wiki called [Illegal Tracklist](http://illegal-tracklist.net/Tracklists/) that has information about most of the samples displayed like this:

<ol><li>"Oh No" - 5:39</li>
<ul><li>0:03 - 2:08 <a class='urllink' href='http://en.wikipedia.org/wiki/Black%20Sabbath' rel='nofollow'>Black Sabbath</a> - "<a class='urllink' href='http://en.wikipedia.org/wiki/War%20Pigs' rel='nofollow'>War Pigs</a>"
</li><li>0:13 - 0:15 <a class='urllink' href='http://en.wikipedia.org/wiki/Tupac_Shakur' rel='nofollow'>2Pac</a> featuring <a class='urllink' href='http://en.wikipedia.org/wiki/K-Ci%20&amp;%20JoJo' rel='nofollow'>K-Ci &amp; JoJo</a> - "<a class='urllink' href='http://en.wikipedia.org/wiki/How%20Do%20U%20Want%20It' rel='nofollow'>How Do U Want It</a>"
</li><li>0:15 - 0:15 <a class='urllink' href='http://en.wikipedia.org/wiki/Jay-Z' rel='nofollow'>Jay-Z</a> - "<a class='urllink' href='http://en.wikipedia.org/wiki/99%20Problems' rel='nofollow'>99 Problems</a>"
</li><li>0:20 - 2:02 <a class='urllink' href='http://en.wikipedia.org/wiki/Ludacris' rel='nofollow'>Ludacris</a> featuring <a class='urllink' href='http://en.wikipedia.org/wiki/Mystikal' rel='nofollow'>Mystikal</a> and <a class='urllink' href='http://en.wikipedia.org/wiki/I-20%20%28rapper%29' rel='nofollow'>I-20</a> - "<a class='urllink' href='http://en.wikipedia.org/wiki/Move%20Bitch' rel='nofollow'>Move Bitch</a>"
</li>
⋮
<li>4:45 - 4:55 <a class='urllink' href='http://en.wikipedia.org/wiki/Trina' rel='nofollow'>Trina</a> featuring <a class='urllink' href='http://en.wikipedia.org/wiki/Killer%20Mike' rel='nofollow'>Killer Mike</a> - "Look Back at Me"
</li><li>4:53 - 4:53 <a class='urllink' href='http://en.wikipedia.org/wiki/N.W.A' rel='nofollow'>N.W.A</a> - "Appetite for Destruction" (portion sampled samples "Get Me Back on Time, Engine #9" by <a class='urllink' href='http://en.wikipedia.org/wiki/Wilson_Pickett' rel='nofollow'>Wilson Pickett</a>)
</li><li>4:56 - 5:39 <a class='urllink' href='http://en.wikipedia.org/wiki/Missy%20Elliott' rel='nofollow'>Missy Elliott</a> - "<a class='urllink' href='http://en.wikipedia.org/wiki/Get%20Ur%20Freak%20On' rel='nofollow'>Get Ur Freak On</a>"
</li></ul>

<li>"Let It Out" - 6:29</li>
<ul><li>0:00 - 0:01 <a class='urllink' href='http://en.wikipedia.org/wiki/Ramones' rel='nofollow'>Ramones</a> - "<a class='urllink' href='http://en.wikipedia.org/wiki/Blitzkrieg%20Bop' rel='nofollow'>Blitzkrieg Bop</a>"
</li><li>0:00 - 0:05 <a class='urllink' href='http://en.wikipedia.org/wiki/Missy%20Elliott' rel='nofollow'>Missy Elliott</a> - "<a class='urllink' href='http://en.wikipedia.org/wiki/Get%20Ur%20Freak%20On' rel='nofollow'>Get Ur Freak On</a>"
</li><li>0:00 - 0:10 <a class='urllink' href='http://en.wikipedia.org/wiki/Busta%20Rhymes' rel='nofollow'>Busta Rhymes</a> featuring <a class='urllink' href='http://en.wikipedia.org/wiki/Sean%20Paul' rel='nofollow'>Sean Paul</a> and Spliff Star - "<a class='urllink' href='http://en.wikipedia.org/wiki/Make%20It%20Clap' rel='nofollow'>Make It Clap</a>"
</li>
⋮
</ul>
</ol>

At first, I used Enlive to suck down the HTML versions of the wiki pages, but I realized it might be cleaner to operate off the raw wiki markup which looks like this:

```
!! 1. "Oh No" - 5:39
* 0:03 - 2:08 [[http://en.wikipedia.org/wiki/Black%20Sabbath | Black Sabbath]] - "[[http://en.wikipedia.org/wiki/War%20Pigs | War Pigs]]"
* 0:13 - 0:15 [[http://en.wikipedia.org/wiki/Tupac_Shakur | 2Pac]] featuring [[http://en.wikipedia.org/wiki/K-Ci%20&%20JoJo | K-Ci & JoJo]] - "[[http://en.wikipedia.org/wiki/How%20Do%20U%20Want%20It | How Do U Want It]]"
* 0:15 - 0:15 [[http://en.wikipedia.org/wiki/Jay-Z | Jay-Z]] - "[[http://en.wikipedia.org/wiki/99%20Problems | 99 Problems]]"
* 0:20 - 2:02 [[http://en.wikipedia.org/wiki/Ludacris | Ludacris]] featuring [[http://en.wikipedia.org/wiki/Mystikal | Mystikal]] and [[http://en.wikipedia.org/wiki/I-20%20%28rapper%29 | I-20]] - "[[http://en.wikipedia.org/wiki/Move%20Bitch | Move Bitch]]"
* 0:20 - 0:54 JC featuring [[http://en.wikipedia.org/wiki/Yung%20Joc | Yung Joc]] - "Vote 4 Me"
```

I wrote a few specialized functions to pull the details out of the strings and into a data structure, but it quickly became unwieldy and unreadable.  I then saw that this was a perfect opportunity to use [Instaparse](https://github.com/Engelberg/instaparse).  Instaparse is a library that makes it easy to build parsers in Clojure by writing context-free grammars.

Here's the Instaparse grammar that I used that parses the Illegal Tracklists' markup format:

```clojure
wiki-line = title-track-line | sample-track-line | <''>

title-track-line = <'!! '> track-number <'. '> track-name <' - '> track-time
track-number = #'\\d+'
track-name = #'[^-]+(?= - )'
track-time = time

sample-track-line = <'* '> start-time <' - '> end-time <' '> artist-name <' - '> sample-name
artist-name = (link | artist-plain-text)*
artist-plain-text = #'[^\\[]+(?= - )' | #'[^\\[]+(?=\\[)'

sample-name = (link | sample-plain-text)*
sample-plain-text = #'[^\\[]*'

link = <'[['> url <' | '> text <']]'>
url = #'[^|]+(?= | )'
text = #'[^]]*'

start-time = time
end-time = time
<time> = #'\\d+:\\d+'
```

The high level structure is practically self-documenting: each line in the wiki source is either a title track line, a sample track line, or a blank line and each type of line is pretty clearly broken down into named components that are separated by string literals to be ignored in the output.  It does, however, become a bit nasty when you get to the terminal rules that are defined as regular expressions.  Instaparse truly delivers on its tagline:

> What if context-free grammars were as easy to use as regular expressions?

The only problem is that regular expressions *aren't* always easy to use, especially when you have to start worrying about not greedily matching the text that is going to be used by Instaparse.

<blockquote class="twitter-tweet" lang="en"><p>Some people, when confronted with a problem, think “I know, I&#39;ll use Instaparse.” Now they have three problems. <a href="https://twitter.com/hashtag/clojure?src=hash">#clojure</a></p>&mdash; Matt Adereth (@adereth) <a href="https://twitter.com/adereth/status/525670531396165632">October 24, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Despite some of the pain of regular expressions and grammar debugging, Instaparse was awesome for this part of the project and I would definitely use it again.  I love the organization that it brought to the code and the structure I got out was very usable:

```clojure
({:tag :wiki-line,
  :content
  ({:tag :title-track-line,
    :content
    ({:tag :track-number, :content ("1")}
     {:tag :track-name, :content ("\"Oh No\" ")}
     {:tag :track-time, :content ("5:39")})})}
 {:tag :wiki-line,
  :content
  ({:tag :sample-track-line,
    :content
    ({:tag :start-time, :content ("0:03")}
     {:tag :end-time, :content ("2:08")}
     {:tag :artist-name,
      :content
      ({:tag :link,
        :content
        ({:tag :url,
          :content ("http://en.wikipedia.org/wiki/Black%20Sabbath")}
         {:tag :text, :content ("Black Sabbath")})})}
     {:tag :sample-name,
      :content
      ({:tag :sample-plain-text, :content ("\"")}
       {:tag :link,
        :content
        ({:tag :url,
          :content ("http://en.wikipedia.org/wiki/War%20Pigs")}
         {:tag :text, :content ("War Pigs")})}
       {:tag :sample-plain-text, :content ("\"")})})})}
 {:tag :wiki-line,
  :content
  ({:tag :sample-track-line,
    :content
    ({:tag :start-time, :content ("0:13")}
     {:tag :end-time, :content ("0:15")}
     {:tag :artist-name,
      :content
      ({:tag :link,
        :content
        ({:tag :url,
          :content ("http://en.wikipedia.org/wiki/Tupac_Shakur")}
         {:tag :text, :content ("2Pac")})}
       {:tag :artist-plain-text, :content (" featuring ")}
       {:tag :link,
        :content
        ({:tag :url,
          :content ("http://en.wikipedia.org/wiki/K-Ci%20&%20JoJo")}
         {:tag :text, :content ("K-Ci & JoJo")})})}
     {:tag :sample-name,
      :content
      ({:tag :sample-plain-text, :content ("\"")}
       {:tag :link,
        :content
        ({:tag :url,
          :content
          ("http://en.wikipedia.org/wiki/How%20Do%20U%20Want%20It")}
         {:tag :text, :content ("How Do U Want It")})}
       {:tag :sample-plain-text, :content ("\"")})})})}
       ...
```
