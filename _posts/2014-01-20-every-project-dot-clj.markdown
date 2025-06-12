---
layout: post
title: Every project.clj
date: 2014-01-20 17:33
comments: true
categories: github data clojure
---
I was recently looking for an interesting relational dataset for another project and the idea of using the dependencies for every Clojure project on GitHub came up.  It turns out that it's possible to download almost every project.clj using [Tentacles](https://github.com/Raynes/tentacles), so I decided to...

![Image](/images/download-all.png)

The most annoying part was dealing with GitHub's rate limits, but after waiting a few hours I had them all on local disk and was able to play around.  I haven't gotten to dig into the data for the actual project I'm doing, but there were a couple simple queries that I thought were worth sharing.

## Most frequently included packages

I was able to download 10770 project.clj files.  Here are the 50 most frequently included packages listed in their `:dependencies`:

Dependency | Count
----------|-------
org.clojure/clojure-contrib | 1524
compojure | 1348
hiccup | 743
clj-http | 738
ring/ring-jetty-adapter | 607
cheshire | 558
org.clojure/data.json | 552
clj-time | 526
org.clojure/tools.logging | 490
enlive | 444
noir | 388
ring/ring-core | 375
ring | 361
org.clojure/tools.cli | 348
org.clojure/java.jdbc | 344
org.clojure/clojurescript | 339
org.clojure/core.async | 235
midje | 227
org.clojure/math.numeric-tower | 219
korma | 206
incanter | 202
seesaw | 195
overtone | 172
slingshot | 160
quil | 158
com.taoensso/timbre | 150
http-kit | 149
ring/ring-devel | 145
org.clojure/math.combinatorics | 145
org.clojure/core.logic | 138
environ | 132
aleph | 132
log4j | 131
ch.qos.logback/logback-classic | 125
org.clojure/tools.nrepl | 124
congomongo | 124
com.datomic/datomic-free | 123
com.novemberain/monger | 123
lib-noir | 121
org.clojure/core.match | 118
ring/ring-json | 111
clojure | 110
org.clojure/data.xml | 110
log4j/log4j | 109
mysql/mysql-connector-java | 109
postgresql/postgresql | 107
org.clojure/data.csv | 101
org.clojure/tools.trace | 98
org.clojure/tools.namespace | 92
ring-server | 92
<br/>
I think it makes a nice hit-list of projects to check out!

A couple interesting things jumped out at me:

1. 12.5% of Clojure projects on GitHub are using Compojure.  Impressive.
2. congomongo, com.novemberain/monger, com.datomic/datomic-free, mysql/mysql-connector-java, and postgresql/postgresql are all clustered together in the low 100's.

## Most frequently applied licenses

Just over half of the project.clj's don't contain a `:license`.  Here are the most popular:

License | Count
---|----
EPL | 4430
MIT | 336
Apache | 106
BSD | 92
GPL | 90
LGPL | 25
CC | 21
WTFPL | 18
AGPL | 11
Mozilla  | 11
<br/>
The EPL's dominance doesn't come as a surprise, given Clojure's use of it for the core libraries.

23 projects have "WTF" or "fuck" in their license string:

License | Count
---|----
WTFPL | 18
Do What The Fuck You Want To Public License | 3
DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE Version 2 | 1
All Rights Reserved Muthafucka | 1

## Conclusion

I'd like to share a mirror of just the project.clj files wrapped up in a single download, but I want to be conscientious of the variety of licenses.  I'll clean up the code for pulling and summarizing all this data soon so others can play with it.  In the meantime, feel free to suggest other analyses that could be done on these...