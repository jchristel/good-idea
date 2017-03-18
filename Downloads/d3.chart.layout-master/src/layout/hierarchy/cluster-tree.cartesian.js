
d3.chart("cluster-tree").extend("cluster-tree.cartesian", {

  initialize : function() {

    var chart = this;

    chart.margin(chart._margin || {});

    chart.d3.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });


    chart.layers.nodes.on("enter", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y0 + "," + chart.source.x0 + ")"; });

      this.select("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; });
    });

    chart.layers.nodes.on("merge:transition", function() {
      this.duration(chart._duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
    });

    chart.layers.nodes.on("exit:transition", function() {
      this
        .attr("transform", function(d) { return "translate(" + chart.source.y + "," + chart.source.x + ")"; });
    });


    chart.on("change:margin", function() {
      chart._width  = chart.base.attr("width")  - chart._margin.left - chart._margin.right;
      chart._height = chart.base.attr("height") - chart._margin.top  - chart._margin.bottom;
      chart.base.attr("transform", "translate(" + chart._margin.left + "," + chart._margin.top + ")");
    });
  },



  transform: function(root) {
    var chart = this,
        nodes;
    chart.source = root;

    if ( ! chart.root) {
      chart.root    = root;
      chart.root.x0 = chart._height / 2;
      chart.root.y0 = 0;

      nodes = chart.d3.layout
        .size([chart._height, chart._width])
        .nodes(chart.root); // workaround for getting correct chart.root to transform method in hierarchy.js

      chart.trigger("collapse:init");
    }

    nodes = chart.d3.layout
      //.size([chart._height, chart._width])
      .nodes(chart.root).reverse();

//    nodes.forEach(function(d) { d.y = d.depth * 180; });

    chart.on("transform:stash", function() {
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    });

    return nodes;
  },


  margin: function(_) {
    if (!arguments.length) {
      return this._margin;
    }

    ["top", "right", "bottom", "left"].forEach(function(dimension) {
      if (dimension in _) {
        this[dimension] = _[dimension];
      }
    }, this._margin = { top: 0, right: 0, bottom: 0, left: 0 });

    this.trigger("change:margin");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },
});


