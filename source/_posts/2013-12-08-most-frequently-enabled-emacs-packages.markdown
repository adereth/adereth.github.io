---
layout: post
title: "Most frequently enabled Emacs packages"
date: 2013-12-08 20:38
comments: true
categories: emacs
---
As part of the Emacs-24.4 release, emacs-devel is conducting [a survey](http://www.emacswiki.org/emacs/FrequentlyEnabledPackages_Emacs244_Survey) to find out which vanilla GnuEmacs packages/modes people enable by default.  The responses are in one big plain-text alphabetical list which isn't really conducive to browsing.

I've gone through the most frequently enabled ones to see what they do.  I figured others might be interested, so I've put the top ones in order of popularity, along with brief descriptions and links to the related pages if one exists.  Enjoy!

- `uniquify` - [Uniquify](http://www.emacswiki.org/emacs/uniquify) overrides the default mechanism for making buffer names unique (using suffixes like `<2>`, `<3>` etc.) with a more sensible behaviour which use parts of the file names to make the buffer names distinguishable.  This will be turned on by default in 24.4.

- `column-number-mode` - Displays which column the cursor is currently on in the mode line.

- `show-paren-mode` - [show-paren-mode](http://www.emacswiki.org/emacs/ShowParenMode) allows you to see matching pairs of parentheses and other characters. When the cursor is on one of the paired characters, the other is highlighted.

- `ido-mode` - [Ido](http://www.emacswiki.org/emacs/InteractivelyDoThings) lets you interactively do things with buffers and files.  The [Introduction to Ido Mode](http://www.masteringemacs.org/articles/2010/10/10/introduction-to-ido-mode/) on [Mastering Emacs](http://www.masteringemacs.org/) does a much better job of explaining why and how you should use it.

- `transient-mark-mode` - [Transient Mark mode](http://www.emacswiki.org/emacs/TransientMarkMode) gives you much of the standard selection-highlighting behavior of other editors.  This is on by default in recent Emacsen.

- `ibuffer` - [Ibuffer](http://www.emacswiki.org/emacs/IbufferMode) is an advanced replacement for BufferMenu, which lets you operate on buffers much in the same manner as Dired.

- `blink-cursor-mode` - Toggle cursor blinking.  This is on by default.

- `flyspell-mode` - [Flyspell](http://www.emacswiki.org/emacs/FlySpell) enables on-the-fly spell checking in Emacs by the means of a minor mode.

- `recentf-mode` - [Recentf](http://www.emacswiki.org/emacs/RecentFiles) is a minor mode that builds a list of recently opened files. This list is is automatically saved across Emacs sessions. You can then access this list through a menu.

- `eldoc-mode` - [Eldoc-mode](http://www.emacswiki.org/emacs/ElDoc) is a MinorMode which shows you, in the echo area, the argument list of the function call you are currently writing.

- `dired-x` - [Dired X](http://www.emacswiki.org/emacs/DiredExtra) provides extra functionality for DiredMode.

- `windmove` - [Wind Move](http://www.emacswiki.org/emacs/WindMove) lets you move point from window to window using Shift and the arrow keys.

- `line-number-mode` - [Line Numbers](http://www.emacswiki.org/emacs/LineNumbers) displays line numbers in a buffer, or otherwise indicates line numbers, without actually changing the buffer content.

- `winner-mode` - [Winner Mode](http://www.emacswiki.org/emacs/WinnerMode) allows you to undo and redo changes in the window configuration with the key commands `C-c left` and `C-c right`.
