---
layout: post
title: Custom Clojure Evaluation Keybindings in Emacs
date: 2014-05-29 06:28
comments: true
categories: clojure emacs
---
I love [REPL Driven Development](http://blog.jayfields.com/2014/01/repl-driven-development.html).  My style is to write expressions directly in the file that I'm working on and to use `C-x C-e` to view the value of the last command in the minibuffer.

Being able to move my cursor to a sub-expression and see the value of that expression immediately feels like a superpower.  I love this ability and it's one of the things that keeps me locked into Clojure+Emacs as my preferred enviroment.

This power can be taken to the next level by making custom evaluation commands that run whatever you want on the expression at your cursor.

## The Basic Pattern
Let's start by looking at the Elisp that defines `cider-eval-last-sexp`, which is what gets invoked when we press `C-x C-e`:

```clojure
(defun cider-eval-last-sexp (&optional prefix)
  "Evaluate the expression preceding point.
If invoked with a PREFIX argument, print the result in the current buffer."
  (interactive "P")
  (if prefix
      (cider-interactive-eval-print (cider-last-sexp))
    (cider-interactive-eval (cider-last-sexp))))
```

The important part is that we can use `cider-last-sexp` to get the expression before the cursor as a string and we can evaluate a string by passing it to `cider-interactive-eval`.  We'll write some basic Elisp to make a new function that modifies the string before evaluation and then we'll bind this function to a new key sequence.

The essential pattern we'll use is:

```clojure
(defun custom-eval-last-sexp ()
  (interactive)
  (cider-interactive-eval
    (format "(require 'some-namespace)
             (some-namespace/some-fn %s)"
            (cider-last-sexp))))

(define-key cider-mode-map (kbd "C-c c") 'custom-eval-last-sexp)
```

If you happen to still be using Swank or nrepl.el, you should use `swank-interactive-eval` and `swank-last-sexp` or `swank-interactive-eval` and `nrepl-last-sexp`. 

Let's look at some of the useful things we can do with this...

## Collections
I frequently deal with collections that are too big to display nicely in the minibuffer.  It's nice to be able to explore them with a couple keystrokes.  Here's a simple application of the pattern that gives us the size of the collection by just hitting `C-c c`:

```clojure
(defun count-last-expression ()
       (interactive)
       (cider-interactive-eval
         (format "(count %s)"
                 (cider-last-expression))))

(define-key cider-mode-map (kbd "C-c c") 'count-last-expression)
```

Another useful one is to just show the nth value.  This one is a little more interesting because it requires a parameter:

```clojure
(defun nth-from-last-expression (n)
       (interactive "p")
       (cider-interactive-eval
         (format "(nth %s %s)"
                 (cider-last-expression) n)))

(define-key cider-mode-map (kbd "C-c n") `nth-from-last-expression)
```

If you just use `C-c n`, Emacs defaults the parameter value to 1.  You can pass an argument using [Emacs' universal argument functionality](http://www.gnu.org/software/emacs/manual/html_node/emacs/Arguments.html).  For example, to get the 0^th element, you could either use `C-u 0 C-c n` or `M-0 C-c n`.

## Write to File
Sometimes the best way to view a value is to look at it in an external program.  I've used this pattern when working on Clojure code that generates SVG, HTML, and [3D models](/blog/2014/04/09/3d-printing-with-clojure/).  Here's what I use for 3D modeling:

```clojure
(defun spit-scad-last-expression ()
  (interactive)
  (cider-interactive-eval
    (format	
      "(require 'scad-clj.scad)
       (spit \"eval.scad\" (scad-clj.scad/write-scad %s))"
      (cider-last-expression))))

(define-key cider-mode-map (kbd "C-c 3") 'spit-scad-last-expression)
```

This writes the `eval.scad` file to the root directory of the project.  It's great because OpenSCAD watches open files and automatically refreshes when they change.  You can run this on an expression that defines a shape and immediately see the shape in another window.  I used this technique in [my recent presentation on 3D printing at the Clojure NYC meetup](http://www.meetup.com/Clojure-NYC/events/180303582/) and I got feedback that this made the live demos easier to follow.

Here's what it looks like when you `C-c 3` on a nested expression that defines a cube:

![OpenScad Screenshot](/images/show-scad.png)

## View Swing Components
If you have to use Swing, your pain can be slightly mitigated by having a quick way to view components.  This will give you a shortcut to pop up a new frame that contains what your expression evaluates to:

```clojure
(defun frame-last-expression ()
  (interactive)
  (cider-interactive-eval
    (format	
     "(doto (javax.swing.JFrame. \"eval\")
        (.. (getContentPane) (add %s))
        (.pack)
        (.show))"
     (cider-last-expression))))

(define-key cider-mode-map (kbd "C-c f") 'frame-last-expression)
```

This plays nicely with [Seesaw](https://github.com/daveray/seesaw), but doesn't presume that you have it on your classpath.  Here's what it looks like when you `C-c f` at the end of an expression that defines a Swing component:

![JFrame Screenshot](/images/show-frame.png)

## Benchmarking with Criterium
In [A Few Interesing Clojure Microbenchmarks](/blog/2013/11/22/a-few-interesting-clojure-microbenchmarks/), I mentioned Hugo Duncan's [Criterium library](https://github.com/hugoduncan/criterium).  It's a reliable way of measuring the performance of an expression.  We can bring it closer to our fingertips by making a function for benchmarking an expression instead of just evaluating it:

```clojure
(defun benchmark-last-expression ()
  (interactive)
  (cider-interactive-eval
    (format "(require 'criterium.core)
             (criterium.core/quick-benchmark %s)"
            (cider-last-expression))))

(define-key cider-mode-map (kbd "C-c b") 'benchmark-last-expression)
```

## Conclusion
I find this simple pattern to be quite handy.  Also, when I'm showing off the power of nrepl to the uninitiated, being able to invoke arbitrary functions on whatever is at my cursor looks like pure magic.

I hope you find this useful and if you invent any useful bindings or alternative ways of implementing this pattern, please share!