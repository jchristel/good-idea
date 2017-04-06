---
layout: post
title:  "Database to D3"
date:   2017-03-18 19:00:00 +1100
categories: dataViz
tags:
  - javascript
  - PHP
  - Python
  - MySQL
  - JSON
  - UTF-8
---

# Connecting things up 

## PHP vs JavaScript vs Python

There are, as always, a few ways to query a database back end pass the results back to D3 for visualization.
* PHP
    * Seems to be the traditional way of doing things
    * With PHP 5.5.0 the standard MySQL extensions where depreciated in favour of the new MySQLi
       * MAMP has support for either version of PHP
       * A lot of the samples available however still reference < PHP 5.5.0

* JavaScript 
    * node.js appears to be a similar in capability and has the additional advantage of staying with the same language

* Python 
    * As capable as the other two. And that is as far as my research went.

## PHP for now

I've done some research into Python but it [looks](http://blog.nlpapi.co/using-mamp-mysql-with-python/) like it requires some tinkering to get going with MAMP.

To be honest I haven't looked much into javascript at all at this point in time apart from some articles on the web comparing it to PHP.

I will stick to PHP since it is supported out of the box on MAMP. The [sample](http://www.d3noob.org/2013/02/using-mysql-database-as-source-of-data.html) I've found will work with < PHP 5.5.0. Once I got this going I will change over to follow this [tutorial](https://www.binpress.com/tutorial/using-php-with-mysql-the-right-way/17).

## Oh ok UTF-8 encoding

Looks like the data I pushed into excel does not adhere to UTF-8 encoding which in turn created havoc once the data got to D3. Luckily I could use NotePad ++ to show any non UTF-8 characters in my sample data. 
It looks like there are at least two more ways to enforce UTF-8 encoding:
* MySQL can [enforce](http://stackoverflow.com/questions/202205/how-to-make-mysql-handle-utf-8-properly) UTF-8 encoding
* PHP can also do the trick:
    * `$json = json_encode(utf8_encode($nestedArray));` 
    * `$json = utf8_encode(json_encode($nestedArray));` 

Hm I wonder whether the order matters?


## Rebuilding the required nested JSON structure

The PHP sample mentioned above returns all entries in my database row by row in JSON format. Nice but not quite what I'm [after]({{ site.baseurl }}{% post_url 2017-02-07-DataFormat %}). [Here](https://www.sitepoint.com/community/t/unexpected-end-of-json-input-error-in-php/254313) is another PHP sample which takes that data and nests it. However that nesting does not look quite right. Children are not within an array marked by `[{}]` instead just `{}`.  Lets see how I go...