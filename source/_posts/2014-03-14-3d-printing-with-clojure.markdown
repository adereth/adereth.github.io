---
layout: post
title: "3D Printing with Clojure"
date: 2014-04-09 07:02
comments: true
categories: clojure keyboards
---
I've been doing some 3D printing for [my next keyboard project](https://twitter.com/adereth/status/444145229109555200/photo/1) and I've got a workflow that I'm pretty happy with that I'd like to share.

When I first started trying to make models a month ago, I tried [Blender](http://www.blender.org/).  It's an amazing beast, but after a few hours of tutorials it was clear that it would take a while to get proficient with it.  Also, it is really designed for interactive modeling and I need something that I can programmatically tweak.

## OpenSCAD

![OpenSCAD Screenshot](/images/openscad.gif)

A couple of friends suggested [OpenSCAD](http://www.openscad.org/), which is touted as "the programmers' solid 3D CAD modeler."  It provides a power set of primitive shapes and operations, but the language itself leaves a bit to be desired.  This isn't a beat-up-on-SCAD post, but a few of the things that irked me were:

- Strange function application syntax (parameters in parens after the function name with an expression or block following the closing paren)
- Unclear variable binding rules (multiple passes are made over the code and the results of changing a variable may affect things earlier in the code unexpectedly)
- No package/namespace management
- Multiple looping constructs that depend on what you are going to do with the results, not on how you want to loop

## scad-clj
Fortunately, [Matt Farrell](https://github.com/farrellm) has written [scad-clj](https://github.com/farrellm/scad-clj), an OpenSCAD DSL in Clojure.  It addresses every issue I had with OpenSCAD and lends itself to a really nice workflow with the Clojure REPL.

To get started using it, add the dependency on [`[scad-clj "0.1.0"]`](https://clojars.org/scad-clj) to your `project.clj` and fire up your REPL.

All of the functions for creating 3D models live in the `scad-clj.model` namespace.  There's no documentation yet, so in the beginning you'll have to look at the [source for `model.clj`](https://github.com/farrellm/scad-clj/blob/master/src/scad_clj/model.clj) and occassionally the [OpenSCAD documentation](http://www.openscad.org/documentation.html).  Fortunately, there really isn't much to learn and it's quite a revelation to discover that almost everything you'll want to do can be done with a handful of functions.

Here's a simple model that showcases each of the primitive shapes:

```clojure
(def primitives
  (union
   (cube 100 100 100)
   (sphere 110)
   (cylinder 10 150)))
```

Evaluating this gives us a data structure that can be converted into an .scad file using `scad-clj.scad/write-scad` to generate a string and `spit`.

```clojure
(spit "post-demo.scad"
      (write-scad primitives))
```

We're going to use OpenSCAD to view the results.  One feature of OpenSCAD that is super useful for this workflow is that it watches opened files and automatically refreshes the rendering when the file is updated.  This means that we can just re-evaluate our Clojure code and see the results immediately in another window:

![Primitives Screenshot](/images/scad-primitives.png)

scad-clj makes all new primitive shapes centered at the origin.  We can use the shape operator functions to move them around and deform them:

```clojure
(def primitives
  (union
   (->> (cube 100 100 100)
        (rotate (/ Math/PI 4) [1 1 1])
        (translate [150 0 0]))
   (->> (sphere 70)
        (scale [1/2 1/2 2])
        (translate [-150 0 0]))
   (cylinder 10 160)))
```

![Operator Screenshot](/images/scad-operators.png)

I snuck `union` into those examples.  Shapes can also be combined using `intersection`, `difference`, and `hull`.  It's pretty incredible how much can be done with just these.  For example, here's the latest iteration of my keyboard design built using clj-scad:

![Keyboard](/images/scad-keyboard.png)

## 3D Printing

Once your design is complete, you can use OpenSCAD to export it as an STL file which can then be imported to software like [ReplicatorG](http://replicat.org/) or [Makerware](https://www.makerbot.com/makerware/) for processing into an .x3g file that can be printed:

![Keyboard](/images/printed.JPG)
