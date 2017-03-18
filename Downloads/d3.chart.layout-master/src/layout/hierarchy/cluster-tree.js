
d3.chart("hierarchy").extend("cluster-tree", {

  initialize : function() {

    var chart = this;

    var counter = 0;

    chart.radius(chart._radius || 4.5);

    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

    chart.layers.links = chart.layers.base.append("g").classed("links", true);
    chart.layers.nodes = chart.layers.base.append("g").classed("nodes", true);


    chart.layer("nodes", chart.layers.nodes, {

      dataBind: function(data) {
        return this.selectAll(".node")
          .data(data, function(d) { return d._id || (d._id = ++counter); });
      },

      insert: function() {
        return this.append("g")
          .classed("node", true);
      },

      events: {
        "enter": function() {
          this.append("circle")
            .attr("r", 0)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

          this.append("text")
            .attr("dy", ".35em")
            .text(function(d) { return d[chart._name]; })
            .style("fill-opacity", 0);

          // http://stackoverflow.com/questions/1067464/need-to-cancel-click-mouseup-events-when-double-click-event-detected/1067484#1067484
          this.on("click", function(event) {
            var that = this;

            setTimeout(function() {
              var dblclick = parseInt(that.getAttribute("data-double"), 10);
              if (dblclick > 0) {
                that.setAttribute("data-double", dblclick-1);
              } else {
                chart.trigger("singleClick", event);
              }
            }, 300);
            d3.event.stopPropagation();

          }).on("dblclick", function(event) {
            this.setAttribute("data-double", 2);
            chart.trigger("doubleClick", event);
            d3.event.stopPropagation();
          });
        },

        "merge:transition": function() {
          this.select("circle")
            .attr("r", function(d) { return chart._radius === "_COUNT" && d._children ? d._children.length
                                                                                      : chart._radius === "_COUNT" && d.children ? d.children.length
                                                                                      : chart._radius === "_COUNT" && ! d._children ? 1
                                                                                      : chart._radius === "_COUNT" && ! d.children ? 1 : chart._radius; })
            .style("stroke", function(d) { return d.path ? "brown" : "steelblue"; })
            .style("fill", function(d) { return d.path && ! d.parent.path ? "#E2A76F"
                                                                          : d._children ? "lightsteelblue" : "#fff"; });
          this.select("text")
            .style("fill-opacity", 1);
        },

        "exit:transition": function() {
          this.duration(chart._duration)
            .remove();

          this.select("circle")
            .attr("r", 0);

          this.select("text")
            .style("fill-opacity", 0);
        },
      }
    });


    chart.layer("links", chart.layers.links, {
      dataBind: function(data) {
        return this.selectAll(".link")
          .data(chart.d3.layout.links(data), function(d) { return d.target._id; });
      },

      insert: function() {
        return this.append("path")
          .classed("link", true);
      },

      events: {
        "enter": function() {
          this
            .attr("d", function(d) {
              var o = { x: chart.source.x0, y: chart.source.y0 };
              return chart.d3.diagonal({ source: o, target: o });
            });
        },

        "merge:transition": function() {
          this.duration(chart._duration)
            .attr("d", chart.d3.diagonal)
            .attr("stroke", function(d) { return d.source.path && d.target.path ? "#dd7b7b" : "#ccc"; })
            .style("stroke-width", function(d) { return d.path ? 1 : 1.5; });
        },

        "exit:transition": function() {
          this.duration(chart._duration)
            .attr("d", function(d) {
              var o = { x: chart.source.x, y: chart.source.y };
              return chart.d3.diagonal({ source: o, target: o });
            })
            .remove();
        },
      },
    });
  },


  radius: function(_) {
    if (!arguments.length) {
      return this._radius;
    }

    this._radius = _;

    this.trigger("change:radius");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  collapsible: function(_) {
    var chart = this;

    var depth = _;

    chart.once("collapse:init", function() {

      if (depth !== undefined) {

        chart.walker(
          chart.root,
          function(d) { if (d.depth == depth) { collapse(d); }},
          function(d) {
            if (d.children && d.children.length > 0 && d.depth < depth) {
              return d.children;
            } else if (d._children && d._children.length > 0 && d.depth < depth) {
              return d._children;
            } else {
              return null;
            }
          }
        );
      }
    });



    chart.on("singleClick", function(d) {
      d = toggle(d);
      chart.trigger("transform:stash");
      chart.draw(d);
    });


    function toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      return d;
    }

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    return this;
  },

});


