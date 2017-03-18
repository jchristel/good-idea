
d3.chart("hierarchy").extend("pack.flattened", {

  initialize : function() {

    var chart = this;

    chart.d3.layout = d3.layout.pack();
   
    chart._width  = chart.base.attr("width");
    chart._height = chart.base.attr("height");

    chart.flatten(chart._flatten || null);
    chart.formats(chart._formats || {});
    chart.diameter(chart._diameter || Math.min(chart._width, chart._height));

    chart.d3.zoom.translate([(chart._width - chart._diameter) / 2, (chart._height - chart._diameter) / 2]);

    chart.layers.base
      .attr("transform", "translate(" + (chart._width - chart._diameter) / 2 + "," + (chart._height - chart._diameter) / 2 + ")");


    chart.layer("base", chart.layers.base, {

      dataBind: function(data) {
        return this.selectAll(".node")
          .data(data.filter(function(d) { return ! d.children; }));
      },

      insert: function() {
        return this.append("g");
      },

      events: {
        "enter": function() {

          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          this.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("stroke", "#aaa")
            .style("fill", chart._formats.fill);

          this.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d[chart._name].substring(0, d.r / 3); });

          this.append("title")
            .text(chart._formats.title);

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
      }
    });

    chart.on("change:diameter", function() {
      chart.layers.base
        .attr("transform", "translate(" + (chart._width - chart._diameter) / 2 + "," + (chart._height - chart._diameter) / 2 + ")");
    });
  },



  transform: function(root) {
    var chart = this;
    chart.root = root;

    return chart.d3.layout
      .size([chart._diameter, chart._diameter])
      .sort(null)
      .padding(1.5)
      .value(function(d) { return chart._value === "_COUNT" ? 1 : d[chart._value]; })
      .nodes(chart._flatten ? chart._flatten(root) : root);
  },


  diameter: function(_) {
    if (!arguments.length) {
      return this._diameter;
    }

    this._diameter = _ - 10;

    this.trigger("change:diameter");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  flatten: function(_) {
    if (!arguments.length) {
      return this._flatten;
    }

    this._flatten = _;

    this.trigger("change:flatten");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  formats: function(_) {
    if (!arguments.length) {
      return this._formats;
    }
    var chart = this;
    var color = d3.scale.category20c();

    ["title", "fill"].forEach(function(format) {
      if (format in _) {
        this[format] = d3.functor(_[format]);
      }
    }, this._formats = {
       title : function(d) { return d[chart._value]; },
       fill  : function(d) { return color(d[chart._name]); }
      }
    );

    this.trigger("change:formats");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },

});


