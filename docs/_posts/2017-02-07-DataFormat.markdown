---
title:  "Data format"
date:   2017-02-07 13:30:00 +1100
categories: dataViz
tags:
  - JSON
---

# JSON

Many of the samples showcased on the D3 Gallery page are using a JSON file as the data source. The idea behind that is that the JSON file defines the properties and dependencies of each of the data points. This in turn makes it a lot easier for D3 to convert that already structured data into a nice looking diagram. In my case, the data structure the diagram required looked like this:

```json
{
 "name": "flare",
 "children": [
  {
   "name": "analytics",
   "children": [
    {
     "name": "cluster",
     "children": [
      {"name": "AgglomerativeCluster", "size": 3938},
      {"name": "CommunityStructure", "size": 3812},
      {"name": "HierarchicalCluster", "size": 6714},
      {"name": "MergeEdge", "size": 743}
     ]
    }
    ]
  }
  ]
}
```
[This](http://www.jsoneditoronline.org) is a handy online JSON editor.

Once I knew what structure and properties the JSON file was meant to have to work with the sample file I picked, I could go ahead and create a script which converts my Excel file into the required JSON structure.