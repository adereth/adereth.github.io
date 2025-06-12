---
layout: post
title: Where LISP Fits
date: 2014-02-03 07:19
comments: true
categories: clojure automata
---
There are a lot of great essays about the power and joy of LISP.  I had read a bunch of them, but none convinced me to actually put the energy in to make it over those parentheses-shaped speed bumps.  A part of me always wanted to, mostly because I'm convinced that our inevitable robot overlords will have to be programs that write programs and everything I had heard made me think that this would likely be done in a LISP.  It just makes sense to be prepared.

Almost two years ago, a coworker showed me some gorgeous code that used Clojure's [thrush macro](http://clojuredocs.org/clojure_core/clojure.core/-%3E) and I fell in love.  I found myself jonesing for `C-x C-e` whenever I tried going back to Java.  I devoured [Programming Clojure](http://www.amazon.com/gp/product/1934356867/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=1934356867&linkCode=as2&tag=adereth-20), then [The Joy of Clojure](http://www.amazon.com/gp/product/1935182641/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=1935182641&linkCode=as2&tag=adereth-20).  In search of a purer hit, I turned to the source: [McCarthy's original paper on LISP](http://www-formal.stanford.edu/jmc/recursive.pdf).  After reading it, I realized what someone could have told me that would have convinced me to invest the time 12 years earlier.

There's a lot of interesting stuff in that paper, but what really struck me was that it felt like it fit into a theoretical framework that I thought I already knew reasonably well.  This post isn't about the power of LISP, which has been covered by others better than I could.  Rather, it's about where LISP fits in the world of computation.

*None of what I'm about to say is novel or rigorous.  I'm pretty sure that all the novel and rigorous stuff around this topic is 50 - 75 years old, but I just wasn't exposed to it as directly as I'm going to try and lay out.*

## The Automaton Model of Computation

One of my favorite classes in school was [15-453: Formal Languages, Automata, and Computation](http://www.cs.cmu.edu/~lblum/flac/index.htm), which used [Sipser's Introduction to the Theory of Computation](http://www.amazon.com/gp/product/113318779X/ref=as_li_ss_il?ie=UTF8&camp=1789&creative=390957&creativeASIN=113318779X&linkCode=as2&tag=adereth-20):

<a href="http://www.amazon.com/gp/product/113318779X/ref=as_li_ss_il?ie=UTF8&camp=1789&creative=390957&creativeASIN=113318779X&linkCode=as2&tag=adereth-20"><img src="/images/sipser.jpg" width="250"></a>

One aspect that I really enjoyed was that there was a narrative; we started with Finite State Automata (FSA), analyzed the additional power of Pushdown Automata (PDA), and saw it culminate in Turing Machines \(TM\).  Each of these models look very similar and have a natural connection: *they are each just state machines with different types of external memory.*

The tape in the Turing Machine can be viewed as two stacks, with one stack representing everything to the left of the current position and the other stack as the current position and everything to the right.  With this model, we can view the computational hierarchy (FSA -> PDA -> TM) as just state machines with 0, 1, or 2 stacks.  I think it's quite an elegant representation and it makes the progression seem quite natural.

A key insight along the journey is that these machines are equivalent in power to other useful systems.  A sizable section in the chapter on Finite State Automata is dedicated to their equivalence with Regular Expressions (RegEx).  Context Free Grammars (CFG) are actually introduced *before* Pushdown Automata.  But when we get to Turing Machines, there's nothing but a couple paragraphs in a section called "Equivalence with Other Models", which says: 

> Many \[languages\], such as Pascal and LISP, look quite different from one another in style and structure.  Can some algorithm be programmed in one of them and not the others?  Of course not -- we can compile LISP into Pascal and Pascal into LISP, which means that the two languages describe *exactly* the same class of algorithms.  So do all other reasonable programming languages.

The book and class leave it at that and proceed onto the limits of computability, which is the real point of the material.  But there's a natural question that isn't presented in the book and which I never thought to ask:

<center>
Finite State Automata <i class="fa fa-arrows-h"></i> Regular Expressions<br>
Pushdown Automata <i class="fa fa-arrows-h"></i> Context Free Grammars<br>
Turing Machines <i class="fa fa-arrows-h"></i> ?
</center>
<br>
While we know that there are many models that equal Turing Machines, we could also construct other models that equal FSAs or PDAs.  Why are RegExs and CFGs used as the parallel models of computation?  With the machine model, we were able to just add a stack to move up at each level - is there a natural connection between RegExs and CFGs that we extrapolate to find their next level that is Turing equivalent?

## The Chomsky-Schützenberger Hierarchy

It turns out that the answers to these questions were well covered in the 1950's by the [Chomsky-Schützenberger Hierarchy of Formal Grammars](http://en.wikipedia.org/wiki/Chomsky_hierarchy#The_hierarchy).

The left-hand side of the relations above are the automaton-based models and the right-hand side are the language-based models.  The language models are all implemented as production rules, where some symbols are converted to other symbols.  The different levels of computation just have different restrictions on what kind of replacements rules are allowed.

For instance RegExs are all rules of the form $A \to a$ and $A \to aB$, where the uppercase letters are [non-terminal symbols](http://en.wikipedia.org/wiki/Terminal_and_nonterminal_symbols) and the lowercase are terminal.  In CFGs, some of the restrictions on the right-hand side are lifted.  Allowing terminals to appear on the left-hand side lets us make rules that are conditional on what has already been replaced, which appropriately gets called "Context Sensitive Grammars."  Finally, when all the rules are lifted, we get Recursively Enumerable languages, which are Turing equivalent.  The [Wikipedia page](http://en.wikipedia.org/wiki/Chomsky_hierarchy#The_hierarchy) for the hierarchy and the respective levels is a good source for learning more.

When you look at the definition of LISP in McCarthy's paper, it's much closer to being an applied version of Chomsky's style than Turing's.  This isn't surprising, given that they were contemporaries at MIT.  In McCarthy's [History of Lisp](http://www-formal.stanford.edu/jmc/history/lisp/node3.html#SECTION00030000000000000000), he expicitly states that making a usable version of this other side was his goal:

> These simplifications made LISP into a way of describing computable functions much neater than the Turing machines or the general recursive definitions used in recursive function theory.  The fact that Turing machines constitute an awkward programming language doesn't much bother recursive function theorists, because they almost never have any reason to write particular recursive definitions, since the theory concerns recursive functions in general.  They often have reason to prove that recursive functions with specific properties exist, but this can be done by an informal argument without having to write them down explicitly.  In the early days of computing, some people developed programming languages based on Turing machines; perhaps it seemed more scientific.  Anyway, I decided to write a paper describing LISP both as a programming language and as a formalism for doing recursive function theory.

Here we have it straight from the source.  McCarthy was trying to capture the power of recursive definitions in a usable form.  Just like the automata theorists, once the linguists theorist hit Turing completeness, they focused on the limits instead of the usage.

Theoreticians are more interested in the equality of the systems than the usability, but as practitioners we know that it matters that some problems are more readily solvable in different representations.  Sometimes it's more appropriate to use a RegEx and sometimes an FSA is better suited, even though you could apply either.  While nobody is busting out the Turing Machine to tackle real-world problems, some of our languages are more influenced by one side or the other.

## Turing Machines Considered Harmful

If you track back the imperative/functional divide to Turing Machines and Chomsky's forms, some of the roots are showing.  Turing Machines are conducive to a couple things that are considered harmful in larger systems: GOTO-based<sup>[1](http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html)</sup> and mutation-centric<sup>[2](https://www.google.com/search?q=mutable+state+considered+harmful)</sup> thinking.  In a lot of cases, we're finding that the languages influenced by the language-side are better suited for our problems.  Paul Graham [argues](http://www.paulgraham.com/diff.html) that the popular languages have been steadily evolving towards the LISPy side.

Anyway, this is a connection that I wish I had been shown at the peak of my interest in automata theory because it would have gotten me a lot more excited about LISP sooner.  I think it's interesting to look at LISP as something that has the same theoretical underpinnings as these other tools (RegEx and CFG) that we already acknowledged as vital.

_Thanks to [Jason Liszka](http://jliszka.github.io/) and my colleagues at [Two Sigma](http://www.twosigma.com) for help with this post!_