
d3.chart("cluster-tree.cartesian").extend("tree.cartesian", {

  initialize : function() {
    this.d3.layout = d3.layout.tree();
  },
});
