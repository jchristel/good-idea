
d3.chart("hierarchy", {

  initialize: function() {

    this.d3      = {};
    this.layers  = {};


    this.base.attr("width",  this.base.node().parentElement.clientWidth);
    this.base.attr("height", this.base.node().parentElement.clientHeight);

    this.d3.zoom = d3.behavior.zoom();
    this.layers.base = this.base.append("g");
    
    this.name(this._name         || "name");
    this.value(this._value       || "value");
    this.duration(this._duration || 750);



    // http://bl.ocks.org/robschmuecker/7926762
    this.walker = function (parent, walkerFunction, childrenFunction) {
      if ( ! parent) {
        return;
      }

      walkerFunction(parent);

      var children = childrenFunction(parent);
      if (children) {
        for (var count = children.length, i = 0; i < count; i++) {
          this.walker(children[i], walkerFunction, childrenFunction);
        }
      }
    };

  },



  transform: function(root) {
    return root;
  },


  name: function(_) {
    if (!arguments.length) {
      return this._name;
    }

    this._name = _;

    this.trigger("change:name");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  value: function(_) {
    if (!arguments.length) {
      return this._value;
    }

    this._value = _;

    this.trigger("change:value");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  duration: function(_) {
    if (!arguments.length) {
      return this._duration;
    }

    this._duration = _;

    this.trigger("change:duration");
    if (this.root) {
      this.draw(this.root);
    }

    return this;
  },


  zoomable: function(_) {
    var chart = this;

    var extent = _ || [0, Infinity];

    function zoom() {
      chart.layers.base
        .attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }

    chart.base.call(chart.d3.zoom.scaleExtent(extent).on("zoom", zoom));

    return chart;
  },


  sort: function(_) {
    var chart = this;

    if (_ === "_ASC") {
      chart.d3.layout.sort(function(a, b) { return d3.ascending(a[chart._name], b[chart._name] ); });
    } else if (_ === "_DESC") {
      chart.d3.layout.sort(function(a, b) { return d3.descending(a[chart._name], b[chart._name] ); });
    } else {
      chart.d3.layout.sort(_);
    }

    return this;
  },

});


