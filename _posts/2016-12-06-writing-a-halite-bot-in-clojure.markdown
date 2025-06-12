---
layout: post
title: Writing a Halite Bot in Clojure
date: 2016-12-06 10:42
comments: true
categories: clojure
---
<div>
<script src="/javascripts/halite/pixi.min.js"></script>
<script src="/javascripts/halite/parsereplay.js"></script>
<script src="/javascripts/halite/visualizer.js"></script>
</div>
[![Halite: May the Best Bot Win](/images/halitehero.png)](https://halite.io)

[Halite](https://halite.io) is a new AI programming competition that was recently released by [Two Sigma](https://www.twosigma.com/) and [Cornell Tech](https://tech.cornell.edu/).  It was designed and implemented by two interns at Two Sigma and was run as the annual internal summer programming competition.

While the rules are relatively simple, it proved to be a surprisingly deep challenge.  It's played on a 2D grid and a typical game looks like this:

<center>
<div id="gameReplay" class="text-center"></div>
</center>
<div>

  <script type="text/javascript">

    var data = textFromURL("ar1478846062-2923329127.hlt", $("#gameReplay"), function(data) {
        // console.log(data)
        if(data != null) {
            showGame(data, $("#gameReplay"), null, 500, true, true);
        }
    });

  </script>
</div>

Each turn, all players simultaneously issue movement commands to each of their pieces:

1. Move to an adjacent location and capture it if you are stronger than what's currently there.
2. Stay put and build strength based on the production value of your current location.

When two players' pieces are adjacent to each other, they automatically fight.  A much more detailed description is available on the [Halite Game Rules page](https://halite.io/rules_game.php).

Bots are run as subprocesses that communicate with the game environment through `STDIN` and `STDOUT`, so it's very simple to create bots in the language of your choice.  While Python, Java, and C++ bot kits were all provided by the game developers, the community quickly produced kits for C#, Rust, Scala, Ruby, Go, PHP, Node.js, OCaml, C, and Clojure.  All the starter packages are available on the [Halite Downloads page](https://halite.io/downloads.php).

## Clojure Bot Basics

The flow of all bots are the same:

1. Read the initial state (your player ID and the starting game map conditions)
2. Write your bot's name
3. Read the current gam emap
4. Write your moves
5. GOTO #3

The Clojure kit represents the game map as a 2D vector of `Site` records:

```clojure
(defrecord Site
    [^int x
     ^int y
     ^int production
     ^int strength
     ^int owner])
```

And movement instructions are simple keywords:

```clojure
(def directions [:still :north :east :south :west])
```

A simple bot that finds all the sites you control and issues random moves would look like this:

```clojure
(ns MyBot
  (:require [game] [io])
  (:gen-class))

(defn random-moves
  "Takes your bot's ID and a 2D vector of Sites and returns a map from site to direction"
  [my-id game-map]
  (let [my-sites (->> game-map
                      flatten
                      (filter #(= (:owner %) my-id)))]
    (zipmap my-sites (repeatedly #(rand-nth game/directions)))))

(defn -main []
  (let [{:keys [my-id productions width height game-map]} (io/get-init!)]
    (println "MyFirstClojureBot")
    (doseq [turn (range)]
      (let [game-map (io/create-game-map width height productions (io/read-ints!))]
        (io/send-moves! (random-moves my-id game-map))))))
```

## Next Steps

There are currently almost 900 bots competing on the site, but [there are only a handful written in Clojure](https://halite.io/leaderboard.php?field=language&value=Clojure&heading=Clojure)!  I'm sure the Clojure community could do some interesting things here, so head over to [halite.io](https://halite.io), sign-up using your Github account, and [download the Clojure starter kit](https://halite.io/downloads/starterpackages/Halite-Clojure-Starter-Package.zip).