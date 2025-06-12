---
layout: post
title: Colorful Equations with MathJax
date: 2013-11-29 9:18
comments: true
categories: latex
---
[Stuart Riffle](http://www.altdevblogaday.com/author/stuart-riffle/) wrote up [a great explanation of the Fourier transform](http://www.altdevblogaday.com/2011/05/17/understanding-the-fourier-transform/).  There are a number of great visualizations in his post, but the climax is his explanation of the inverse discrete Fourier transform formula:

![Image](/images/DerivedDFT.png)

What a brilliant representation!  My first thought was that more equations should have such elegant explanations that focus on the comprehension of the reader.  I'd love to be able to produce such clear explanations in this style, so I did a little experimenting with Octopress and [MathJax](http://www.mathjax.org/) to see how easy it would be.

It turns out to only require a few minor yak trimmings to get something nice:

<div style="font-size: 150%;">
$$
\definecolor{energy}{RGB}{114,0,172}
\definecolor{freq}{RGB}{45,177,93}
\definecolor{spin}{RGB}{251,0,29}
\definecolor{signal}{RGB}{18,110,213}
\definecolor{circle}{RGB}{217,86,16}
\definecolor{average}{RGB}{203,23,206}
\color{energy} X_{\color{freq} k} \color{black} =
\color{average} \frac{1}{N} \sum_{n=0}^{N-1}
\color{signal}x_n \color{spin}
e^{\mathrm{i} \color{circle} 2\pi \color{freq}k \color{average} \frac{n}{N}}
$$
</div>

> To find <font color="#7200AC">the energy</font> <font color="2DB15D">at a particular frequency</font>, <font color="#FB001D">spin</font> <font color="#126ED5">your signal</font> <font color="#D04400">around a circle</font> <font color="2DB15D">at that frequency</font>, and <font color="#CB17CE">average a bunch of points along that path</font>.

By using MathJax instead of including a .png we get some nice benefits:

1. Accessibility via screen readers
2. Scalable renderings that look awesome on Retina displays
3. $\LaTeX$ source that is accessible by the audience (right click on the formula)
4. Simplified page-build process and source management

There are [a bunch of guides on setting up MathJax with Octopress](http://www.google.com/search?q=octopress%20mathjax), but I didn't mess with any of them because the [oct2 theme](https://github.com/bijumon/oct2) ships with an alternative `head.html` that is preconfigured to support it.

The only tweak I made was to load the [Color extension for MathJax](http://docs.mathjax.org/en/latest/tex.html#color):

```html
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({ TeX: { extensions: ["color.js"] }});
</script>
```

After adding that, I was able to use the `\definecolor` and `\color` directives just like I would in a paper:

```latex
\definecolor{energy}{RGB}{114,0,172}
\definecolor{freq}{RGB}{45,177,93}
\definecolor{spin}{RGB}{251,0,29}
\definecolor{signal}{RGB}{18,110,213}
\definecolor{circle}{RGB}{217,86,16}
\definecolor{average}{RGB}{203,23,206}
\color{energy} X_{\color{freq} k} \color{black} =
\color{average} \frac{1}{N} \sum_{n=0}^{N-1}
\color{signal}x_n \color{spin}
e^{\mathrm{i} \color{circle} 2\pi \color{freq}k
\color{average} \frac{n}{N}}
```

There were a couple issues:

1. As mentioned in several of the guides, the default markdown processor for Octopress will interfere with the `_` and `^` in your TeX.  I had originally worked around this by escaping them.  At the end, I wrapped the whole expression in a `<div>` to make the font larger, which had the side-effect of eliminating the need for escaping.
2. MathJax's `\definecolor` doesn't seem to support the `HTML` color space, which lets you specify colors in hex codes.  I ended up manually converting the colors back and forth between decimal and hexidecimal for the prose below the equation:

```html
To find <font color="#7200AC">the energy</font>
<font color="2DB15D">at a particular frequency</font>,
<font color="#FB001D">spin</font> <font color="#126ED5">your
signal</font> <font color="#D04400">around a circle</font>
<font color="2DB15D">at that frequency</font>, and
<font color="#CB17CE">average a bunch of points along that
path</font>.
```

Now I just need a formula to explain...
