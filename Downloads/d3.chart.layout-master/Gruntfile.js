module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({

    meta: {
      pkg: grunt.file.readJSON("package.json"),

      srcFiles: ["src/**/*.js", '!src/layout/hierarchy/header.js', '!src/layout/hierarchy/footer.js'],

      banner: "/*!\n" +
              " * <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n" +
              " * <%= meta.pkg.homepage %>\n" +
              " * \n" +
              " * Copyright (c) 2015 <%= meta.pkg.author.name %>\n" +
              " * Library released under <%= meta.pkg.license.type %> license.\n" +
              " */\n"
    },

    watch: {
      scripts: {
        files: "<%= meta.srcFiles %>",
        tasks: ["concat"]
      }
    },

    jshint: {
      options: {
        curly: true,
        undef: true
      },
      chart: {
        options: {
          browser: true,
          globals: {
            d3: true
          }
        },
        files: {
          src: "<%= meta.srcFiles %>"
        }
      },
      grunt: {
        options: {
          node: true
        },
        files: {
          src: ["Gruntfile.js"]
        }
      }
    },

    concat: {
      stage: {
        files: {
          "stage/parents.js": [
            "src/layout/hierarchy/hierarchy.js",
            "src/layout/hierarchy/cluster-tree.js",
            "src/layout/hierarchy/cluster-tree.cartesian.js",
            "src/layout/hierarchy/cluster-tree.radial.js"
          ],
          "stage/children.js": [
            "src/layout/hierarchy/cluster.cartesian.js",
            "src/layout/hierarchy/cluster.radial.js",
            "src/layout/hierarchy/pack.flattened.js",
            "src/layout/hierarchy/pack.nested.js",
            "src/layout/hierarchy/partition.arc.js",
            "src/layout/hierarchy/partition.rectangle.js",
            "src/layout/hierarchy/tree.cartesian.js",
            "src/layout/hierarchy/tree.radial.js",
            "src/layout/hierarchy/treemap.js"
          ]
        }
      },
      release: {
        options: {
          banner: "<%= meta.banner %>"
        },
        files: {
          "d3.chart.layout.hierarchy.js": [
            "src/layout/hierarchy/header.js",
            "stage/parents.js",
            "stage/children.js",
            "src/layout/hierarchy/footer.js"
          ]
        }
      }
    },

    uglify: {
      options: {
        preserveComments: "some"
      },
      release: {
        files: {
          "d3.chart.layout.hierarchy.min.js": "d3.chart.layout.hierarchy.js"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["concat"]);
  grunt.registerTask("release", ["jshint", "concat", "uglify"]);
};

