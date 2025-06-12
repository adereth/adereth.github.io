---
layout: post
title: Counting Stars on GitHub
date: 2013-12-23 08:10
comments: true
categories: github data clojure
---
<script type="text/javascript" src="http://mbostock.github.com/d3/d3.min.js"></script>

I've been working on a nerd ethnography project with the [GitHub API](http://developer.github.com/v3/).  There's so much fun data to play with there that it's inevitable that I'll get a little distracted...

One distraction was the realization that I could use the search API to get a massive list of the top repos ordered by star count.  Once I started looking at the results, I realized that star data is an interesting alternative metric for evaluating language popularity.  Instead of looking at which languages people are actually writing new projects using, we can see which languages are used for the most popular projects.

## What are stars?
In August 2012, GitHub [announced](https://github.com/blog/1204-notifications-stars) a new version of their notification system that allowed users to easily mark a repository as interesting by "starring" it:


![GitHub star UI](/images/github-star-ui.png)


Stars are essentially lightweight bookmarks that are publicly visible.  Even though they were introduced just over a year ago, all "watches" were converted to stars so there's plenty of data.

## Which are the most starred repos?
Let's start by looking at the top 20:

 Rank | Repository | Language | Stars
-----|-----|-----|----
 1 | [twbs/bootstrap](http://github.com/twbs/bootstrap) | JavaScript | 62111
 2 | [jquery/jquery](http://github.com/jquery/jquery) | JavaScript | 27082
 3 | [joyent/node](http://github.com/joyent/node) | JavaScript | 26352
 4 | [h5bp/html5-boilerplate](http://github.com/h5bp/html5-boilerplate) | CSS | 23355
 5 | [mbostock/d3](http://github.com/mbostock/d3) | JavaScript | 20715
 6 | [rails/rails](http://github.com/rails/rails) | Ruby | 20284
 7 | [FortAwesome/Font-Awesome](http://github.com/FortAwesome/Font-Awesome) | CSS | 19506
 8 | [bartaz/impress.js](http://github.com/bartaz/impress.js) | JavaScript | 18637
 9 | [angular/angular.js](http://github.com/angular/angular.js) | JavaScript | 17994
 10 | [jashkenas/backbone](http://github.com/jashkenas/backbone) | JavaScript | 16502
 11 | [Homebrew/homebrew](http://github.com/Homebrew/homebrew) | Ruby | 15065
 12 | [zurb/foundation](http://github.com/zurb/foundation) | JavaScript | 14944
 13 | [blueimp/jQuery-File-Upload](http://github.com/blueimp/jQuery-File-Upload) | JavaScript | 14312
 14 | [harvesthq/chosen](http://github.com/harvesthq/chosen) | JavaScript | 14232
 15 | [mrdoob/three.js](http://github.com/mrdoob/three.js) | JavaScript | 13686
 16 | [vhf/free-programming-books](http://github.com/vhf/free-programming-books) | *Unknown* | 13658
 17 | [adobe/brackets](http://github.com/adobe/brackets) | JavaScript | 13557
 18 | [robbyrussell/oh-my-zsh](http://github.com/robbyrussell/oh-my-zsh) | Shell | 13337
 19 | [jekyll/jekyll](http://github.com/jekyll/jekyll) | Ruby | 13283
 20 | [github/gitignore](http://github.com/github/gitignore) | *Unknown* | 13128
<br/>
If you want to play with the data yourself, I've put a cache of the top 5000 repositories [here](/data/top-5000-repos.20131219.csv).  I've also posted the Clojure code I wrote to collect the data at [adereth/counting-stars](https://github.com/adereth/counting-stars).

## Which languages have the top spots?
In [Adam Bard's Top Github Languages for 2013 (so far)](http://adambard.com/blog/top-github-languages-for-2013-so-far/), he counted repo creation and found that JavaScript and Ruby were pretty close.  The top star counts tell a very different story, with JavaScript dominating 7 of the top 10 spots.  CSS was in 11th place in his analysis, but it's 2 of the top 10 spots.

Observing that 7 of the top 10 spots are JavaScript gives a sense for both the volume and the relative ranking of JavaScript in that range of the leaderboard, but just seeing that another language is 50 of the top 5000 spots doesn't give nearly as much color.

One approach is to look at the number of repos in different ranges for each language:

Language | 1-10 | 1-100 | 1-1000 | 1-5000 | Top Repository
---------|-----------|-------|--------|--------|----
JavaScript | 7 | 54 | 385 | 1605 | [twbs/bootstrap](http://github.com/twbs/bootstrap) (1)
CSS | 2 | 8 | 41 | 174 | [h5bp/html5-boilerplate](http://github.com/h5bp/html5-boilerplate) (4)
Ruby | 1 | 9 | 153 | 786 | [rails/rails](http://github.com/rails/rails) (6)
Python |  | 5 | 64 | 420 | [django/django](http://github.com/django/django) (44)
*Unknown* |  | 5 | 30 | 138 | [vhf/free-programming-books](http://github.com/vhf/free-programming-books) (15)
C++ |  | 4 | 22 | 108 | [textmate/textmate](http://github.com/textmate/textmate) (35)
PHP |  | 3 | 38 | 248 | [symfony/symfony](http://github.com/symfony/symfony) (58)
Shell |  | 3 | 19 | 89 | [robbyrussell/oh-my-zsh](http://github.com/robbyrussell/oh-my-zsh) (18)
Objective-C |  | 2 | 89 | 495 | [AFNetworking/AFNetworking](http://github.com/AFNetworking/AFNetworking) (30)
C |  | 2 | 31 | 185 | [torvalds/linux](http://github.com/torvalds/linux) (25)
Go |  | 2 | 13 | 61 | [dotcloud/docker](http://github.com/dotcloud/docker) (45)
Java |  | 1 | 32 | 255 | [nathanmarz/storm](http://github.com/nathanmarz/storm) (56)
VimL |  | 1 | 23 | 66 | [mathiasbynens/dotfiles](http://github.com/mathiasbynens/dotfiles) (57)
CoffeeScript |  | 1 | 22 | 80 | [jashkenas/coffee-script](http://github.com/jashkenas/coffee-script) (43)
Scala |  |  | 13 | 46 | [playframework/playframework](http://github.com/playframework/playframework) (178)
C# |  |  | 8 | 65 | [SignalR/SignalR](http://github.com/SignalR/SignalR) (205)
Clojure |  |  | 2 | 37 | [technomancy/leiningen](http://github.com/technomancy/leiningen) (361)
Perl |  |  | 2 | 26 | [sitaramc/gitolite](http://github.com/sitaramc/gitolite) (138)
ActionScript |  |  | 2 | 10 | [mozilla/shumway](http://github.com/mozilla/shumway) (606)
Emacs Lisp |  |  | 1 | 20 | [technomancy/emacs-starter-kit](http://github.com/technomancy/emacs-starter-kit) (477)
Erlang |  |  | 1 | 15 | [erlang/otp](http://github.com/erlang/otp) (568)
Haskell |  |  | 1 | 12 | [jgm/pandoc](http://github.com/jgm/pandoc) (740)
TypeScript |  |  | 1 | 4 | [bitcoin/bitcoin](http://github.com/bitcoin/bitcoin) (161)
Assembly |  |  | 1 | 3 | [jmechner/Prince-of-Persia-Apple-II](http://github.com/jmechner/Prince-of-Persia-Apple-II) (269)
Elixir |  |  | 1 | 2 | [elixir-lang/elixir](http://github.com/elixir-lang/elixir) (666)
Objective-J |  |  | 1 | 2 | [cappuccino/cappuccino](http://github.com/cappuccino/cappuccino) (667)
Rust |  |  | 1 | 1 | [mozilla/rust](http://github.com/mozilla/rust) (225)
Vala |  |  | 1 | 1 | [p-e-w/finalterm](http://github.com/p-e-w/finalterm) (282)
Julia |  |  | 1 | 1 | [JuliaLang/julia](http://github.com/JuliaLang/julia) (356)
Visual Basic |  |  | 1 | 1 | [bmatzelle/gow](http://github.com/bmatzelle/gow) (800)
TeX |  |  |  | 6 | [ieure/sicp](http://github.com/ieure/sicp) (2441)
R |  |  |  | 5 | [johnmyleswhite/ML_for_Hackers](http://github.com/johnmyleswhite/ML_for_Hackers) (2125)
Lua |  |  |  | 4 | [leafo/moonscript](http://github.com/leafo/moonscript) (3351)
PowerShell |  |  |  | 3 | [chocolatey/chocolatey](http://github.com/chocolatey/chocolatey) (1580)
Prolog |  |  |  | 3 | [onyxfish/csvkit](http://github.com/onyxfish/csvkit) (3498)
XSLT |  |  |  | 2 | [wakaleo/game-of-life](http://github.com/wakaleo/game-of-life) (1093)
Matlab |  |  |  | 2 | [zk00006/OpenTLD](http://github.com/zk00006/OpenTLD) (1292)
OCaml |  |  |  | 2 | [MLstate/opalang](http://github.com/MLstate/opalang) (1380)
Dart |  |  |  | 2 | [dart-lang/spark](http://github.com/dart-lang/spark) (1463)
Groovy |  |  |  | 2 | [Netflix/asgard](http://github.com/Netflix/asgard) (1489)
Lasso |  |  |  | 1 | [symfony/symfony-docs](http://github.com/symfony/symfony-docs) (2047)
LiveScript |  |  |  | 1 | [gkz/LiveScript](http://github.com/gkz/LiveScript) (2226)
Scheme |  |  |  | 1 | [eholk/harlan](http://github.com/eholk/harlan) (2648)
Common Lisp |  |  |  | 1 | [google/lisp-koans](http://github.com/google/lisp-koans) (2889)
XML |  |  |  | 1 | [kswedberg/jquery-tmbundle](http://github.com/kswedberg/jquery-tmbundle) (2972)
Mirah |  |  |  | 1 | [mirah/mirah](http://github.com/mirah/mirah) (2985)
Arc |  |  |  | 1 | [arclanguage/anarki](http://github.com/arclanguage/anarki) (3389)
DOT |  |  |  | 1 | [cplusplus/draft](http://github.com/cplusplus/draft) (3583)
Racket |  |  |  | 1 | [plt/racket](http://github.com/plt/racket) (3761)
F# |  |  |  | 1 | [fsharp/fsharp](http://github.com/fsharp/fsharp) (4518)
D |  |  |  | 1 | [D-Programming-Language/phobos](http://github.com/D-Programming-Language/phobos) (4719)
Ragel in Ruby Host |  |  |  | 1 | [jgarber/redcloth](http://github.com/jgarber/redcloth) (4829)
Puppet |  |  |  | 1 | [ansible/ansible-examples](http://github.com/ansible/ansible-examples) (4979)
<br/>
The table is interesting, but it still doesn't give us a good sense for how the middle languages (C#, Scala, Clojure, Go) compare.  It also reveals that there are different star distributions within the languages.  For instance, CSS makes a showing in the top 10 but it has way fewer representatives (174) in the top 5000 than PHP (248), Objective C (495), or Java (255).

Looking at the top repo for each language also exposes a weakness in the methodology: GitHub's language identification isn't perfect and there are number of polyglot projects.  The top Java repo is [Storm](http://github.com/nathanmarz/storm), which uses enough Clojure (20.1% by GitHub's measure) to make this identification questionable when you take into account Clojure's conciseness over Java's.

## What about star counts?
Looking at the results after ranking obscures the actual distribution of stars.  Using a [squarified treemap](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.36.6685&rep=rep1&type=pdf) with star count for the size and no hierarchy is a compact way of visualizing the ranking while exposing details about the absolute popularity of each repo.  The squarified treemap algorithm roughly maintains the order going from one corner to the other.

Here are the top 1000 repos, using stars for the size and language for the color:

*(Language and repository name shown on mouseover, click to visit repository.  A bit of a fail on touch devices right now.)*
<div id='tm'></div>

<!-- CSS Styles: -->
<div>
  <style type="text/css">
.node {
  border: solid 1px white;
  font: 8px Lato;
  line-height: 12px;
  overflow: hidden;
  position: absolute;
  text-indent: 2px;
}

.tooltip{
    display: inline;
    position: relative;
}

.tooltip:hover:after{
    background: #333;
    background: rgba(0,0,0,.8);
    border-radius: 5px;
    bottom: 26px;
    color: #fff;
    content: attr(title);
    left: 20%;
    padding: 5px 15px;
    position: absolute;
    z-index: 98;
    width: 220px;
}

.tooltip:hover:before{
    border: solid;
    border-color: #333 transparent;
    border-width: 6px 6px 0 6px;
    bottom: 20px;
    content: "";
    left: 50%;
    position: absolute;
    z-index: 99;
}

  </style>
</div>

<script type="text/javascript">

var color = d3.scale.category20();

var margin = {top: 10, right: 0, bottom: 10, left: 0},
    width = $('.entry-content').width(),
    height = 500;

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) { return d.Stars; });

var div = d3.select("#tm").append("div")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

d3.csv("/data/top-1000-repos.20131219.csv", function(repos) {
  treemap.nodes({"children": repos});

  var node = div.datum(repos).selectAll(".node")
    .data(treemap.nodes)
    .enter()
      .append("a")
      .attr("href", function(d) { return d.children ? null : ("http://github.com/" + d.Repository); })
      .attr("class", function(d) { return d.children ? null : "tooltip"; })
      .attr("title", function(d) { return d.children ? null : "Repository: " + d.Repository + "\nLanguage: " + d.Language + "\nStars: " + d.Stars; })
      .append("div")
    .attr("class", "node")
    .call(position)
    .style("background", function(d) { return d.children ? null : color(d.Language); });
});

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
};

</script>

Despite being a little chaotic, we can start to see some of the details of the distributions.  It still suffers from being difficult to glean information about the middling languages.  The comparisons become a little easier if we group the boxes by language.  That's pretty easy, since that's really the intended usage of treemaps.

Here are the top 5000 grouped by language:

<div id='tm2'></div>

<script type="text/javascript">

var treemap2 = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) {return d.children ? null : d.stargazers_count; });

var div2 = d3.select("#tm2").append("div")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

d3.json("/data/lang-map.json", function(root) {
  var node = div2.datum(root).selectAll(".node")
      .data(treemap2.nodes)
      .enter()
      .append("a")
      .attr("href", function(d) { return d.children ? null : ("http://github.com/" + d.user + "/" + d.name); })
      .attr("class", function(d) { return d.children ? null : "tooltip"; })
      .attr("title", function(d) { return d.children ? null : "Repository: " + d.user + "/" + d.name + "\nLanguage: " + d.language + "\nStars: " + d.stargazers_count; })

      .append("div")
      .attr("class", "node")
      .call(position)
      .style("background", function(d) { return d.children ? color(d.name) : null; });

  d3.selectAll("input").on("change", function change() {
    var value = this.value === "count"
        ? function() { return 1; }
        : function(d) { return d.size; };

    node
        .data(treemap.value(value).nodes)
      .transition()
        .duration(1500)
        .call(position);
  });
});


function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
};

</script>

Honestly, I'm not really in love with this visualization, but it was a fun experiment.  I have some ideas for more effective representations, but I need to work on my d3.js-fu.  Hopefully it serves as an inspirational starting point for someone else...

## Conclusion
Firstly, GitHub's API is really cool and can give you some insights that aren't exposed through their UI.  Like I said at the start of this post, I have another project that caused me to look at this API in the first place and I'm really excited for the possibilities with this data.

GitHub's current UI is really focused on using stars to expose what's trending and doesn't really make it easy to see the all-time greatest hits.  Perhaps the expectation is that everyone already knows these repos, but I certainly didn't and I've discovered or rediscovered a few gems.  My [previous post](/blog/2013/12/15/font-awesome-easter-egg/) came about because of my discovery of [Font Awesome](http://fontawesome.io/) through this investigation.

I'll close out with a couple questions (with no question marks) for the audience:

1. Through this lens, JavaScript is *way* more popular than other metrics seem to indicate.  One hypothesis is that we all end up exposing things through the browser, so you end up doing something in JavaScript no matter what your language of choice is.  I'm interested in other ideas and would also appreciate thoughts on how to validate them.

2. It's not obvious to me how to best aggregate ranking data.  I'd love to see someone else take this data and expose something more interesting.  Even if you're not going to do anything with the data, any ideas are appreciated.

<i class="fa fa-star fa-2x"></i>