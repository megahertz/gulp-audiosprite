'use strict';

var expect   = require('chai').expect;
var fs       = require('fs');
var gulp     = require('gulp');
var basename = require('path').basename;
var through2 = require('through2');

var audioSprite = require('.');

describe('gulp-audiosprite plugin', function () {
  it('should create a sprite', function (callback) {
    var files = [];
    gulp.src('node_modules/audiosprite/test/sounds/*.*')
      .pipe(audioSprite({ export: 'ogg,mp3' }))
      .pipe(through2.obj(function (file, _, cb) {
        this.push(file);
        files.push(file);
        cb();
      }, function (cb) {
        var oggFile  = files[0];
        var jsonFile = files[2];

        var baseNames = files.map(function (f) { return basename(f.path) });
        expect(baseNames).to.deep.equal([
          'sprite.ogg', 'sprite.mp3', 'sprite.json'
        ]);

        var json = JSON.parse(jsonFile.contents.toString('utf8'));
        expect(json.resources[0]).to.equal('sprite.ogg');
        expect(json.spritemap.boop.start).to.equal(3);

        var oggSize = fs.statSync(oggFile.path).size;
        expect(oggSize).to.be.above(5 * 1024);

        cb();
        callback();
      }));
  });

  it('should handle error', function (callback) {
    gulp.src('./*.*')
      .pipe(audioSprite({ export: 'ogg,mp3' }))
      .on('error', function (err) {
        expect(err.message).to.match(/gulp-audiosprite: Error /);
        callback();
      });
  });
});
