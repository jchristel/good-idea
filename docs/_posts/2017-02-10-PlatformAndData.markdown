---
layout: post
title:  "Platform and Data"
date:   2017-02-10 08:00:00 +1100
categories: dataViz
tags:
  - javascript
  - D3
  - Excel
  - Data Structure
---
# So Far

I want to create a proof of concept application which allows project team members to quickly find reasons as to why we choose a certain solution over another.
This application is meant to be visually appealing, easily accessible in terms of platform (desktop, phone ...) and intuitive to use.

## Platform

In the moment I have settled for [D3](https://d3js.org) for visualization. Reasons being:
* It's web based or more precisely it is a javascript library 
* it offers a wide range of [graphs](https://github.com/d3/d3/wiki/Gallery) and tools to create graphs easily from data
* Development is still active but (maybe?) not as active as [processing](https://processing.org)
* Why not [processing](https://groups.google.com/forum/#!topic/d3-js/KjGW94SyrAg) 

In order to build javascript code and test it I needed a webserver. [MAMP](https://www.mamp.info/en/) is great since it creates a local webserver on my citrix instance which also happens to have MySQL support.

Back end database: MySQL. I know it (a little) and MAMP has got a MySQL server build in.

## Data
To start of I needed some data, preferable relating to a project rather then complete random stuff. The CAD/Out folder of one of the projects I am working on was an ideal source. 

### Data Structure
Since I am trying to visualize design events/ decisions the following applies:
* Decisions follow on from other decisions (parent <-> child relation ship)
* One decision (parent) can influence multiple other decisions which are not necessarily a direct child. Ouch. Or in an example a change in building height (parent) will influence number of lifts (child) which will influence the core design (some distant relative). The core design is however also influenced by services (black sheep of the family)...
* Decision are made at a point in time 
* Decisions are made by somebody or a group of people

### Data Recording
In the moment I'm using MS Excel to record very basic data points in a format like so:

| ID       | Name           | Description  |Parent ID  |Date  |other Links  |
| --------:|:--------------:|:------------:|:---------:|:----:|:-----------:|
| 1        | Sydney Project      | Sydney very High high rise... |0|12/10/2016||
| 2        | Structure      | base concept |1|15/10/2016||
| 3        | Facade      | opaque |1|17/10/2016||


Not great but it gives me what I am after for the moment.



