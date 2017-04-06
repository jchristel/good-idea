---
layout: post
title:  "Choice of Diagram(s)"
date:   2017-02-06 09:00:00 +1100
categories: dataViz
tags:
  - javascript
  - D3
  - Sunburst
  - Tree View
---

# So many Diagrams 

Looking at the D3 sample page, I narrowed down the choice of diagrams to start with to two: Tree View and Sunburst.

## Tree View
![tree]({{ site.baseurl }}/assets/images/posts/Tree_BW.svg){:class="img-responsive"}{: height="300px" width="300px"}

Whilst this diagram initially looked like the obvious choice because of its very clear hierarchical structure it has some short comings:
* Large amount of data will make this diagram look very messy very quickly and requires a lot of screen real estate to display.
* Not sure how to display secondary relations on top of this diagram

## SunBurst
![sun]({{ site.baseurl }}/assets/images/posts/SunBurst.svg){:class="img-responsive"}{: height="300px" width="300px"}

This diagram takes a moment to get used to, since relationships are not that obvious at the first glance. However:
* It can display large amount of data in a very compact form
* Secondary relation ships might be easier to show