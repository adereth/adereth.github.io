---
layout: post
title: "java.awt.Shape's Insidious Insideness"
date: 2014-04-30 11:41
comments: true
categories: 
---
I recently added text support to the [scad-clj](https://github.com/farrellm/scad-clj) 3D modeling library and encountered an interesting bug:

![Poorly rendered 4](/images/bad4.png)

See that 4?  No hole!  Why?!?  All the other holes are there...

## Shape Outlines
First, let's look at how you get the outline of some text in a font in Java:

```groovy
FontRenderContext frc = new FontRenderContext(
		  null,
		  RenderingHints.VALUE_TEXT_ANTIALIAS_DEFAULT,
		  RenderingHints.VALUE_FRACTIONALMETRICS_DEFAULT);
Font font = new Font("Andale Mono", Font.PLAIN, 12);
String myText = "1234567890";
PathIterator path = font
	     .createGlyphVector(frc, myText)
	     .getOutline()
	     .getPathIterator(null, 0.01d);
```
We end up with a [`PathIterator`](http://docs.oracle.com/javase/7/docs/api/java/awt/geom/PathIterator.html) that traces along the outline of the character.  This code uses the version of `getPathIterator` that specifies "flatness", which means that we get back a path strictly made up of straight line segments that approximate the curves.

Characters that are made from a single filled polygon are relatively easy; there is a single path and the bounded area is what gets filled:

![12357](/images/one-path.png)

The complexity comes when the path crosses over itself or if it is discontinuous and contains multiple outlines:

![46890](/images/multiple-parts.png)

The [JavaDocs for PathIterator](http://docs.oracle.com/javase/7/docs/api/java/awt/geom/PathIterator.html) explain a bit about how to actually determine what is inside the path.  All of the fill areas are determined using the [`WIND_EVEN_ODD` rule](http://docs.oracle.com/javase/7/docs/api/java/awt/geom/PathIterator.html#WIND_EVEN_ODD): *a point is in the fill area if it is contained by an odd number of paths.*

For example, the dotted zero is made up of three paths:

1. The outline of the outside of the oval
2. The outline of the inside of the oval
3. The outline of the dot

The points inside #1 but outside #2 are in 1 area and the points inside #3 are inside 3 areas.

## Counting Areas
For each path, we need to count how many other paths contain it.  One way is to use [`java.awt.geom.Path2D.Double`](http://docs.oracle.com/javase/7/docs/api/java/awt/geom/Path2D.Double.html) to make a Shape and then use the `contains(double x, double y)` method to see if any of the points from the other paths are in it.

I incorrectly assumed that each Shape contained at least one of the points that define it's outline.  It usually does, which is why all the other holes were properly rendered, but it doesn't for some shapes, including triangles in certain orientations!

The [JavaDoc for Shape](http://docs.oracle.com/javase/7/docs/api/java/awt/Shape.html) says that a point is considered to lie inside a Shape if and only if:

1. It lies completely inside the Shape boundary or
2. It lies exactly on the Shape boundary and the space immediately adjacent to the point in the increasing X direction is entirely inside the boundary or
3. It lies exactly on a horizontal boundary segment and the space immediately adjacent to the point in the increasing Y direction is inside the boundary.

The three points defining the triangle that form the hole in 4 don't meet any of these criteria, so instead of counting as being in 2 paths (itself and the outer outline), it was counted as being in 1.  The fix was to explicitly define a path as containing itself.