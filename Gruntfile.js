
module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['www/modules/**/*.js'],//src文件夹下包括子文件夹下的所有文件
        dest: 'www/dist/xtuiall.js'//合并文件在dist下名为built.js的文件
      }
    },
    uglify: {
      options: {
        separator: ';'
      },
      build: {
        src: 'www/dist/xtuiall.js',//压缩源文件是之前合并的buildt.js文件
        dest: 'www/dist/xtuiall.min.js'//压缩文件为built.min.js
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat','uglify']);
}
