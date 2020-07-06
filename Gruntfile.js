module.exports = function(grunt) {
  function loadPostCssPlugin(name) {
    var plugin;

    try {
      plugin = require(name);
      return plugin;
    } catch (error) {
      plugin = Function.prototype; // no-op
      console.log(error.message + " used by task postcss");
    }

    return plugin;
  }

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-postcss");
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.initConfig({
    sass: {
      options: {
        outputStyle: "compressed"
      },
      dist: {
        files: {
          "dist/styles/Main.css": "src/styles/Main.scss",
          "dist/Components/PhotoCentric/css/PhotoCentric.css":
            "src/app/Components/PhotoCentric/css/PhotoCentric.scss",
          "dist/Components/LayerSwitcher/css/LayerSwitcher.css":
            "src/app/Components/LayerSwitcher/css/LayerSwitcher.scss",
          "dist/Components/Share/css/Share.css":
            "src/app/Components/Share/css/Share.scss",
          "dist/Components/MapCentric/css/MapCentric.css":
            "src/app/Components/MapCentric/css/MapCentric.scss",
          "dist/Components/MobileExpand/css/MobileExpand.css":
            "src/app/Components/MobileExpand/css/MobileExpand.scss",
          "dist/Components/Unsupported/css/UnsupportedBrowser.css":
            "src/app/Components/Unsupported/css/UnsupportedBrowser.scss"
        }
      }
    },
    postcss: {
      options: {
        processors: [
          loadPostCssPlugin("autoprefixer")(),
          loadPostCssPlugin("postcss-normalize-charset")()
        ]
      },
      dist: {
        src: [
          "dist/styles/Main.css",
          "dist/Components/PhotoCentric/css/PhotoCentric.css",
          "dist/Components/LayerSwitcher/css/LayerSwitcher.css",
          "dist/Components/Share/css/Share.css",
          "dist/Components/MapCentric/css/MapCentric.css",
          "dist/Components/MobileExpand/css/MobileExpand.css",
          "dist/Components/Unsupported/css/UnsupportedBrowser.css",
          "!node_modules/**"
        ]
      }
    },
    watch: {
      styles: {
        files: [
          "src/styles/Main.scss",
          "src/app/Components/PhotoCentric/css/PhotoCentric.scss",
          "src/app/Components/LayerSwitcher/css/LayerSwitcher.scss",
          "src/app/Components/Share/css/Share.scss",
          "src/app/Components/MapCentric/css/MapCentric.scss",
          "src/app/Components/MobileExpand/css/MobileExpand.scss",
          "src/app/Components/Unsupported/css/UnsupportedBrowser.scss"
        ],
        tasks: ["styles"]
      }
    },
    tslint: {
      options: {
        configuration: "tslint.json",
        fix: false
      },
      files: {
        src: ["application/**/*.ts"]
      }
    },
    jshint: {
      all: ["Gruntfile.js", "hub-auth-js/**/*.js"],
      ignores: ["**/node_modules/", "tsrules/**/*.js"]
    }
  });

  grunt.registerTask("styles", "compile & autoprefix CSS", ["sass", "postcss"]);
  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("lint:ts", ["tslint"]);
  grunt.registerTask("lint:js", ["jshint:all"]);
  grunt.registerTask("lint", ["lint:js", "lint:ts"]);
};
