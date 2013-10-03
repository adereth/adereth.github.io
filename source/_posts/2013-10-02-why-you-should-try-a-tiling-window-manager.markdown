---
layout: post
title: "Why you should try a tiling window manager"
date: 2013-10-02 07:39
comments: true
categories: 
---
## What is a tiling window manager?

Window managers control the placement and appearance of programs on your screen.

{% img /images/desk.png Messy Desk %}

Most popular window managers are what are called "[compositing window managers](http://en.wikipedia.org/wiki/Compositing_window_manager)," which is what you are using by default in Microsoft Windows, OSX, Gnome, and KDE. They use the desktop metaphor, where each program is treated like a re-sizable piece of paper. You can move them around freely, change their size, and cause them to overlap.

{% img /images/drawersopen.gif Organized Drawers %}

In contrast, a [tiling window manager](http://en.wikipedia.org/wiki/Tiling_window_manager) is more like a well-organized drawer than a desk. The entire surface is divided into non-overlapping buckets where windows are displayed. If you've used pretty much any IDE, like Eclipse or Visual Studio, or a terminal multiplexer, like screen or tmux, you're already familiar with this approach.
## Why should I use one?
### They're efficient

Unlike most popular compositing window managers, tiling window managers really make an attempt at managing your windows for you. Instead of having you constantly reorganize the individual windows on your screen, you specify at a high level how you want windows to be placed and the window manager does it for you. New windows are intelligently placed based on the high-level directives you've already given.

Tiling also lends itself well to really efficient keyboard shortcuts. Because there's an unambiguous arrangement, you can quickly do things like switch focus to the window immediately to the left, right, top, or bottom, as opposed to most compositing window managers where the best keyboard option is Alt-Tabbing through a linear list of all your windows:
### They scale

With innovative features like tags (Awesome) and nested workspaces (ion3/notion), it's possible to sanely deal with huge numbers of windows and workflows. You're able to group and manipulate windows together in more sophisticated ways than you can in traditional window managers that limit operations to all instances of a single application or everything on a virtual desktop.
### They're customizable

Most tiling window managers are written by developers for developers. They tend to provide rich, well-documented APIs that expose hooks for everything you could want.

## Which one should I use?

There are [a number popular tiling window managers to choose from](http://en.wikipedia.org/wiki/Tiling_window_manager#List_of_tiling_window_managers_for_X), but the most popular (based my totally unscientific polling) are:

- [xmonad](http://xmonad.org/)
- [notion](http://notion.sourceforge.net/), a fork of the controversial and now defunct ion3
- [awesome](http://awesome.naquadah.org/)
- [dwm](http://dwm.suckless.org/)

My preferred window manager is notion and it's what I recommend for anyone wanting to dip their toes into the world of tiling window managers. The main reasons I suggest it are:

- Like most of the other options, it's designed for keyboard use, but it has the best mouse support. You can resize frames, move windows across frames, and access context menus in the expected ways with the mouse. Eventually, you probably will stop relying on these things and do everything with the keyboard, but it really makes the transition easier.

- Multiple applications can be put into the same frame and are made into tabs. This is possible with some tweaks to the others, most notably xmonad, but it's built-in with notion and there are great shortcuts for switching between tabs. Do you remember what a revelation it was when tabbed browsing was introduced? Having the ability to use tabs to group and switch between heterogeneous applications is equally incredible.

- It's very stable. I'm still using 3 year old builds of ion3 on some of my machines and I never have any problems.

As of Ubuntu 12.10, you can simply `apt-get install notion` to install it. It's also available in the repositories of a number of other distributions.

In some follow-up posts, I'm going to detail the tweaks that I've made to my notion configuration to improve my workflow.