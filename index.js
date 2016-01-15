var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var audiosprite = require('audiosprite');


var PLUGIN_NAME = 'gulp-audiosprite';
module.exports = gulpAudioSprite;


function gulpAudioSprite(options) {
    var files = [];
    options = setDefaults(options);
    return through.obj(transform, flush);


    function transform(file, enc, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        files.push(file.path);
        callback();
    }

    function flush(callback) {
        var self = this;
        audiosprite(files, options, function(err, result) {
            if (err) {
                return callback(new gutil.PluginError(PLUGIN_NAME, err));
            }

            result = convertData(result, options, self);

            var jsonName = (options.output || 'output') + '.json';
            self.push(new gutil.File({
                base: path.dirname(jsonName),
                path: jsonName,
                contents: new Buffer(JSON.stringify(result, null, 2), 'binary')
            }));
            callback();
        });
    }
}

function convertData(data, options, self) {
    var urls = data.urls || data.resources || (data.src ? [data.src] : []) || [];

    urls.forEach(function(url) {
        self.push(new gutil.File({
            base: path.dirname(url),
            path: url,
            contents: fs.createReadStream(url)
        }));
    });
    urls = urls.map(function(url) {
        var base = path.basename(url);
        return options._path ? options._path + '/' + base : base;
    });

    switch (options.format) {
        case 'howler':
            data.urls = urls;
            break;
        case 'createjs':
            data.src = urls[0];
            break;
        default:
            data.resources = urls;
    }

    return data;
}

function setDefaults(options) {
    options = options || {};

    var tmp = require('os').tmpDir() || '.';
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

        gutil.log(text, data);
    }

    options.logger = {
        debug: log.bind(null, DEBUG),
        info:  log.bind(null, INFO),
        log:   log.bind(null, NOTICE)
    };
}
