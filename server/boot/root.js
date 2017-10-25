'use strict';
var fs = require('fs');
var async = require('async');
var multer = require('multer');
var tinify = require("tinify");
var AccessKeyID = 'AKIAIV3HRFX362E5OSCQ';
var SecretAccessKeyID = 'Z4UjmhLnWwXU7jexWoeQr68Z4bTo3xu8SnlUm8Y0';
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  accessKeyId: AccessKeyID,
  secretAccessKey: SecretAccessKeyID
});
tinify.key = "ejbRY9wtrHbP2MSNAGMw0Y9MajcrLfhp";
tinify.validate(function (err) {
  if (err) return console.log('err credential: ', err);
  console.log('no hay error en credenciales');
});
module.exports = function (server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();

  router.get('/', server.loopback.status());

  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/media');
    },
    filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
  });

  var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
      if (['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
        return callback(new Error('Wrong extension type'));
      }
      callback(null, true);
    }

  }).array('file');

  router.post('/upload-image', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        return res.json({
          error_code: 1,
          err_desc: err
        });
      }
      let files = req.files;
      let urlImages = [];


      async.forEachOfSeries(files, (obj, index, cb) => {
        var ruta = './client/media/' + obj.filename;
        var rutaToFile = './client/media/optimized-' + obj.filename;
        var source = tinify.fromFile(ruta);
        source.toFile(rutaToFile, (err) => {
          if (err) {
            return console.log('err : ', err);
          }
          fs.readFile(rutaToFile, (err, sourceData) => {
            if (err) return res.status(500).json({
              err: err
            });
            s3.putObject({
              Bucket: 'easymaq-develop-images',
              Key: 'optimized-' + obj.filename,
              ACL: 'public-read',
              Body: sourceData
            }, (err, data) => {
              if (err) return res.status(500).json({
                err: err
              });
              urlImages.push('https://s3.amazonaws.com/easymaq-develop-images/optimized-' + obj.filename);
              fs.unlink(ruta, (err) => {
                if (err) return console.log('err: ', err);
                fs.unlink(rutaToFile, (err) => {
                  if (err) return console.log('err: ', err);
                  cb();
                });
              });
            });
          });
        });
      }, () => {
        console.log('complete');
        return res.status(200).json({
          data: urlImages
        });
      });
    });
  });

  server.use(router);
};
