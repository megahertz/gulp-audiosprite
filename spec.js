'use strict';

var fs       = require('fs');
var gulp     = require('gulp');
var basename = require('path').basename;
var through2 = require('through2');

require('mocha');
require('should');

var audioSprite = require('.');

describe('gulp-audiosprite plugin', function () {
  it('should create a sprite', function (callback) {
    var files = [];
    gulp.src('node_modules/audiosprite/test/sounds/*.*')
      .pipe(audioSprite({
        export: 'ogg,mp3',
        log:    'notice'
      }))
      .pipe(through2.obj(function (file, _, cb) {
        this.push(file);
        files.push(file);
        cb();
      }, function (cb) {
        var oggFile  = files[0];
        var jsonFile = files[2];

        var baseNames = files.map(function (f) { return basename(f.path); });
        baseNames.should.deepEqual(['sprite.ogg', 'sprite.mp3', 'sprite.json']);

        var json = JSON.parse(jsonFile.contents.toString('utf-8'));
        json.resources[0].should.equal('sprite.ogg');
        json.spritemap.boop.start.should.equal(3);

        var oggSize = fs.statSync(oggFile.path).size;
        oggSize.should.be.above(5 * 1024);

        cb();
        callback();
      }));
  });
});
