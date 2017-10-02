'use strict';

var request = require('request');
var config = require('./auth-config');
var nodemailer = require('nodemailer');
var generator = require('generate-password');
var path = require('path');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dev02.easymaq@gmail.com',
    pass: 'dev02@0202'
  }
});

module.exports = function (server) {

  var router = server.loopback.Router();
  var Usuario = server.models.Usuario;

  server.post('/reset-password', (req, res) => {
    var email = req.body.email;
    var password = generator.generate({
      length: 10,
      numbers: true
    });
    Usuario.findOne({
      where: {
        email: email
      }
    }, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al encontrar usuario'
        });
      }
      if (!result) {
        return res.status(500).json({
          msg: 'El email no se encuentra registrado'
        });
      }
      result.setPassword(password, (err) => {
        if (err) {
          return res.status(500).json({
            err: err,
            msg: 'Error al cambiar password'
          });
        }
        let message = { password: password }
        let renderer = server.loopback.template(path.resolve(__dirname, '../../server/views/set-password.ejs'));
        let html_body = renderer(message);
        transporter.sendMail({
          from: '"Admin Easymaq" <admin@easymaq.com>',
          to: email,
          subject: 'Easymaq',
          html: html_body
        }, function (error, response) {
          if (error) {
            return res.status(500).json({
              err: error,
              msg: 'Error al enviar email'
            });
          }
          return res.status(200).json({
            msg: 'Email enviado correcto',
            res: response
          });
        });
      });
    });
  });

  server.post('/info-corporativo', (req, res) => {
    var nombre = req.body.nombre;
    var email = req.body.email;
    if (nombre && email) {
      transporter.sendMail({
        from: '"Admin Easymaq" <admin@easymaq.com>',
        to: 'cm.easymaq@gmail.com, ventas.easymaq@gmail.com, ventas02.easymaq@gmail.com, leo.ramirez.o@gmail.com, dev03.easymaq@gmail.com',
        subject: 'Informacion de plan coorporativo',
        html: '<p>La persona <b>' + nombre + ' </b> con correo <b>' + email + '</b>, esta interesado en un plan coorporativo <b>'
      }, function (error, response) {
        if (error) {
          return res.status(500).json({
            err: error,
            msg: 'Error al enviar email'
          });
        } else {
          return res.status(200).json({
            msg: 'Email enviado de forma correcta',
            res: response
          });
        }
      });
    } else {
      return res.status(500).json({
        msg: 'Faltan datos para enviar el email'
      });
    }
  });

  server.post('/auth/google', (req, res) => {
    console.log('Ingresa qui');
    var accessTokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
    var peopleApiUrl = 'https://www.googleapis.com/oauth2/v2/userinfo?fields=email%2Cfamily_name%2Cgender%2Cgiven_name%2Chd%2Cid%2Clink%2Clocale%2Cname%2Cpicture%2Cverified_email';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.GOOGLE_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };
    var token_request = 'code=' + req.body.code +
      '&client_id=' + req.body.clientId +
      '&client_secret=' + config.GOOGLE_SECRET +
      '&redirect_uri=' + req.body.redirectUri +
      '&grant_type=authorization_code';
    var request_length = token_request.length;
    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { body: token_request, headers: { 'Content-type': 'application/x-www-form-urlencoded' } }, (err, response, token) => {
      var accessToken = JSON.parse(token).access_token;
      var headers = { Authorization: 'Bearer ' + accessToken };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, headers: headers, json: true }, (err, response, profile) => {
        if (profile.error) {
          return res.status(500).json({ message: profile.error.message });
        }
        console.log('profile: ', profile);


        Usuario.findOne({
          where: { email: profile.email },
          include: {
            relation: 'favorites'
          }
        }, function (err, existingUser) {
          console.log('existingUser: ', existingUser);
          if (existingUser && existingUser.provider == "google") {
            console.log('existe: ');
            return res.status(200).json({
              token: JSON.stringify(existingUser)
            });
          }
          else if (existingUser && existingUser.provider != "google") {
            console.log('update ');
            existingUser.provider_id = profile.id;
            existingUser.provider = "google";
            existingUser.email = profile.email;
            existingUser.picture = profile.picture.replace('sz=50', 'sz=200');
            existingUser.firstName = profile.name;
            existingUser.save((err) => {
              if (err) {
                return res.status(500).json({
                  err: err,
                  message: 'Error al guardar datos'
                });
              }
              res.status(200).json({
                token: JSON.stringify(existingUser)
              });
            });

          }
          else {
            console.log('create: ');
            let user = {};
            user.provider_id = profile.id;
            user.password = '1234561!@#%$';
            user.provider = "google";
            user.email = profile.email;
            user.picture = profile.picture.replace('sz=50', 'sz=200');
            user.firstName = profile.name;
            user.lastName = '';
            Usuario.create(user, (err, result) => {
              if (err) {
                return res.status(500).json({
                  err: err,
                  message: 'Error al guardar datos'
                });
              }
              let message = { email: result.email }
              let renderer = server.loopback.template(path.resolve(__dirname, '../../server/views/welcome.ejs'));
              let html_body = renderer(message);
              transporter.sendMail({
                from: '"Admin Easymaq" <admin@easymaq.com>',
                to: result.email,
                subject: 'Easymaq',
                html: html_body
              }, function (error, response) {
                if (error) {
                  return res.status(500).json({
                    err: error,
                    msg: 'Error al enviar email'
                  });
                }
                result.favorites = [];
                return res.status(200).json({
                  token: JSON.stringify(result)
                });
              });
            });
          }
          // var token = req.header('Authorization').split(' ')[1];
          // var payload = jwt.decode(token, config.TOKEN_SECRET);
        });
      });
    });
  });

  server.post('/auth/facebook', (req, res) => {
    var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name', 'picture.type(large)'];
    var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.FACEBOOK_SECRET,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params, json: true }, function (err, response, accessToken) {
      if (response.statusCode !== 200) {
        return res.status(500).json({ message: accessToken.error.message });
      }
      // Step 2. Retrieve profile information about the current user.
      request.get({ url: graphApiUrl, qs: accessToken, json: true }, function (err, response, profile) {
        if (response.statusCode !== 200) {
          return res.status(500).send({ message: profile.error.message });
        }
        console.log('profile: ', profile);
        Usuario.findOne({
          where: { email: profile.email },
          include: {
            relation: 'favorites'
          }
        }, function (err, existingUser) {
          console.log('existingUser: ', existingUser);
          if (existingUser && existingUser.provider == "facebook") {
            console.log('existe: ');
            res.status(200).json({
              token: JSON.stringify(existingUser)
            });
          }
          else if (existingUser && existingUser.provider != "facebook") {
            console.log('update ');
            existingUser.provider_id = profile.id;
            existingUser.provider = "facebook";
            existingUser.email = profile.email;
            existingUser.picture = profile.picture.data.url;
            existingUser.firstName = profile.name;
            existingUser.save((err) => {
              if (err) {
                return res.status(500).json({
                  err: err,
                  message: 'Error al guardar datos'
                });
              }
              res.status(200).json({
                token: JSON.stringify(existingUser)
              });
            });
          }
          else {
            console.log('create: ');
            let user = {};
            user.provider_id = profile.id;
            user.password = '1234561!@#%$';
            user.provider = "facebook";
            user.email = profile.email;
            user.picture = profile.picture.data.url;
            user.firstName = profile.name;
            user.lastName = '';
            Usuario.create(user, (err, result) => {
              if (err) {
                return res.status(500).json({
                  err: err,
                  message: 'Error al guardar datos'
                });
              }
              let message = { email: result.email }
              let renderer = server.loopback.template(path.resolve(__dirname, '../../server/views/welcome.ejs'));
              let html_body = renderer(message);
              transporter.sendMail({
                from: '"Admin Easymaq" <admin@easymaq.com>',
                to: email,
                subject: 'Easymaq',
                html: html_body
              }, function (error, response) {
                if (error) {
                  return res.status(500).json({
                    err: error,
                    msg: 'Error al enviar email'
                  });
                }
                result.favorites = [];
                return res.status(200).json({
                  token: JSON.stringify(result)
                });
              });
            });
          }
          // var token = req.header('Authorization').split(' ')[1];
          // var payload = jwt.decode(token, config.TOKEN_SECRET);
        });
      });
    });
  });

  server.use(router);

}
