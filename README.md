# gulp-audiosprite

## Installation

Install with [npm](https://npmjs.org/package/gulp-audiosprite):

`npm install --save-dev gulp-audiosprite`

Also you need to [install ffmpeg](http://ffmpeg.org/download.html). ffmpeg should
be available in a PATH environment variable

## Usage

```javascript
var audiosprite = require('gulp-audiosprite');

gulp.task('audiosprite', function() {
  gulp.src('./src/sounds/*.wav')
    .pipe(audiosprite({
      format: 'howler'
    }))
    .pipe(gulp.dest('build/sounds'));
});
```

## Options
Options are tha same as for [audiosprite](https://github.com/tonistiigi/audiosprite/):
 Name       | Default           | Description 
------------|-------------------|-----------------------------------------------------------
 output     | "sprite"          | Name for the output files.
 path       | ""                | Path for files to be used on final JSON.
 export     | "ogg,m4a,mp3,ac3" | Limit exported file types. Comma separated extension list.
 format     | "jukebox"         | Format of the output JSON file (jukebox, howler, createjs).
 log        | "info"            | Log level (debug, info, notice).
 autoplay   | null              | Autoplay sprite name.
 loop       | null              | Loop sprite name, can be passed multiple times.
 silence    | 0                 | Add special "silence" track with specified duration.
 gap        | 1                 | Silence gap between sounds (in seconds).
 minlength  | 0                 | Minimum sound duration (in seconds).
 bitrate    | 128               | Bit rate. Works for: ac3, mp3, mp4, m4a, ogg.
 vbr        | -1                | VBR [0-9]. Works for: mp3. -1 disables VBR.
 samplerate | 44100             | Sample rate.
 channels   | 1                 | Number of channels (1=mono, 2=stereo).
 rawparts   | ""                | Include raw slices(for Web Audio API) in specified formats.