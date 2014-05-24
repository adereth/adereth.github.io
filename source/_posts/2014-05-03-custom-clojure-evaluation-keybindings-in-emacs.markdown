---
layout: post
title: "Custom Clojure Evaluation Keybindings in Emacs"
date: 2014-05-03 20:47
comments: true
categories: 
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

The important part is that we can use `cider-last-sexp` to get the expression before the cursor as a string and we can evaluate a string by passing it to `cider-interactive-eval`.  We'll write some basic Elisp to make a new function that modifies the string before evaluation we'll bind this function to a new key sequence.

The basic pattern we'll use is:

```clojure
(defun custom-eval-last-sexp ()
  (interactive)
  (cider-interactive-eval
    (format "(require 'some-namespace)
             (some-namespace/some-fn %s)"
            (cider-last-sexp))))

(global-set-key (kbd "C-c c") 'custom-eval-last-sexp)
```

There are several alternative eval functions to choose from:

- `cider-interactive-eval` - Evaluate the given FORM and print value in minibuffer.
- `cider-interactive-eval-print` - Evaluate the given FORM and print value in current buffer.
- `cider-popup-eval-print` - Evaluate the given FORM and print the value in a pop-up buffer.

Let's look at some of the useful things we can do with all this...

## Collections
I frequently deal with collections that are too big to display nicely in the minibuffer.  It's nice to be able to explore them with a couple keystrokes.  Here's a simple application of the pattern that gives us the size of the collection by just hitting `C-c c`:

```
(defun count-last-expression ()
       (interactive)
       (cider-interactive-eval
         (format "(count %s)"
                 (cider-last-expression))))

(global-set-key (kbd "C-c c") 'count-last-expression)
```


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

(global-set-key (kbd "C-c 3") 'spit-scad-last-expression)
```

This writes the `eval.scad` file to the root directory of the project.  It's great because OpenSCAD watches open files and automatically refreshes when they change.  You can run this on an expression that defines a shape and immediately see the shape in another window.  I used this technique in [my recent presentation on 3D printing at the Clojure NYC meetup](http://www.meetup.com/Clojure-NYC/events/180303582/) and I got feedback that this made the live demos easier to follow.

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

(global-set-key (kbd "C-c f") 'frame-last-expression)
```

This plays nicely with [Seesaw](https://github.com/daveray/seesaw), but doesn't presume that you have it on your classpath.

## Benchmarking with Criterium
In [A Few Interesing Clojure Microbenchmarks](/blog/2013/11/22/a-few-interesting-clojure-microbenchmarks/), I mentioned Hugo Duncan's [Criterium library](https://github.com/hugoduncan/criterium).  It's a reliable way of measuring the performance of an expression.  We can bring it closer to our fingertips by making a function for benchmarking an expression instead of just evaluating it:

```clojure
(defun benchmark-last-expression ()
  (interactive)
  (cider-interactive-eval
    (format "(require 'criterium.core)
             (criterium.core/quick-benchmark %s)"
            (cider-last-expression))))

(global-set-key (kbd "C-c b") 'benchmark-last-expression)
```

## Disassemble with no.disassemble
[no.dissassemble](https://github.com/gtrak/no.disassemble) is another handy library when performance tuning.  We can get the bytecode for an expression just as easily as we can evaluate it:

```clojure
(defun disassemble-last-expression ()
  (interactive)
  (nrepl-interactive-eval
    (concat	
      "(require 'no.disassemble)"
      "(no.disassemble/disassemble " (nrepl-last-expression) ")")))

(global-set-key (kbd "C-c d") 'disassemble-last-expression)
```
