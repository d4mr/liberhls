const fs = require('fs');
const Router = require('express-promise-router');
const createError = require('http-errors');

const HOSTNAME = 'http://localhost:3000/';

const { spawn } = require('child_process');

const path = require('path');
const router = new Router();

const fileUpload = require('express-fileupload');

router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  safeFileNames: true
}));

router.post('/', (req, res, next) => {
  if (!req.files) {
    return next(createError(400, "Please upload a file"));
  }
  // accessing the file
  const audioFile = req.files.file;

  if (audioFile.mimetype !== 'audio/mpeg') {
    return next(createError(400, "Please upload a file"));
  }
  //  mv() method places the file inside public directory

  let audioFileLocation = `${audioFile.name}_${audioFile.md5}`;
  let audioFileRelativeParentDirectory = path.join(__dirname, '..', 'public', audioFileLocation);
  let audioFileRelativePath = path.join(audioFileRelativeParentDirectory, 'master');

  fs.promises.access(audioFileRelativeParentDirectory)
    // If file exists then fail
    .then(() => next(createError(409, "File already exists")))
    // File doesn't exist, all good
    .catch(() => {
      res.send({
        status: 200,
        result: {
          message: "Success",
          location: audioFileLocation
        }
      });
      return;
    })
    .then(() => fs.promises.mkdir(audioFileRelativeParentDirectory, { recursive: true }))
    .then(() => audioFile.mv(audioFileRelativePath))
    .then(() => {
      spawn('ffmpeg', [
        '-i', audioFileRelativePath,
        '-vn',
        '-ac', '2',
        '-acodec', 'aac',
        '-f', 'segment',
        '-segment_format', 'mpegts',
        '-segment_time', '10',
        '-segment_list_entry_prefix', `${HOSTNAME}${audioFileLocation}/`,
        '-segment_list', path.join(audioFileRelativeParentDirectory, 'index.m3u8'), path.join(audioFileRelativeParentDirectory, 'audio_segment%05d.ts')
      ], {
        cwd: __dirname
      })
    }).catch((err) => {
      console.error(err);
    })

})

module.exports = router;
