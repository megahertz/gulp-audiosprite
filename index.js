'use strict';

// jshint -W040

var audioSprite = require('audiosprite');
var fs          = require('fs');
var os          = require('os');
var path        = require('path');
var through2    = require('through2');
var Vinyl       = require('vinyl');

module.exports  = gulpAudioSprite;


function gulpAudioSprite(options) {
  var files = [];
  options = setDefaults(options);
  return through2.obj(transform, flush);

  function transform(file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit(
        'error',
        new Error('gulp-audiosprite: Streaming not supported')
      );
      return callback();
    }

    files.push(file.path);
    callback();
  }

  function flush(callback) {
    //jshint -W040
    var stream = this;
    audioSprite(files, options, function (err, result) {
      if (err) {
        err.message = 'gulp-audiosprite: ' + err.message;
        stream.emit('error', err);
        return callback();
      }

      result = convertData(result, options, stream);

      var jsonName = (options.output || 'output') + '.json';
      stream.push(new Vinyl({
        base:     path.dirname(jsonName),
        path:     jsonName,
        contents: new Buffer(JSON.stringify(result, null, 2), 'binary')
      }));

      callback();
    });
  }
}

function convertData(data, options, stream) {
  var urls = data.urls || data.resources || (data.src ? [data.src] : []) || [];

  urls.forEach(function (url) {
    stream.push(new Vinyl({
      base:     path.dirname(url),
      path:     url,
      contents: fs.createReadStream(url)
    }));
  });

  urls = urls.map(function (url) {
    var base = path.basename(url);
    return options._path ? options._path + '/' + base : base;
  });

  switch (options.format) {
    case 'howler': {
      // for old versions
      data.urls = urls;
      data.src  = urls;
      break;
    }

    case 'createjs': {
      data.src = urls[0];
      break;
    }

    default: {
      data.resources = urls;
    }
  }

  return data;
}

function setDefaults(options) {
  options = options || {};

  var tmp = os.tmpdir() || '.';
  options.output = tmp + '/' + (options.output ? options.output : 'sprite');

  if (options.path) {
    options._path = options.path;
    delete options.path;
  }

  setLogger(options);

  return options;
}

function setLogger(options) {
  var DEBUG  = 'debug';
  var INFO   = 'info';
  var NOTICE = 'notice';
  var levels = [DEBUG, INFO, NOTICE];

  function log(level, text, data) {
    var userLevel = levels.indexOf(options.log || 'info');
    var logLevel = levels.indexOf(level);

    if (logLevel < userLevel) {
      return;
    }

    console.log(text, data);
  }

  options.logger = {
    debug: log.bind(null, DEBUG),
    info:  log.bind(null, INFO),
    log:   log.bind(null, NOTICE)
  };
}
