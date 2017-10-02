'use strict';

var path = require('path');
var nodemailer = require('nodemailer');
var hogan = require('hogan.js');
let moment = require('moment');
var fs = require('fs');
var template = fs.readFileSync(path.resolve(__dirname, '../../server/views/welcome.hjs'), 'utf-8');
var compiledTemplate = hogan.compile(template);
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
  var Company = server.models.Company;
  var Plan = server.models.Plan;

  router.post('/usuarios', (req, res) => {
    let user = {};
    let company = {};
    let newPlan = {
      price: 0,
      simple: 1000,
      destacado: 1,
      premium: 0,
      dateCreated: moment().toISOString(),
      dateTerminated: moment().add(6, 'months').toISOString()
    }
    user.email = req.body.email;
    user.password = req.body.password;
    user.home = 2;
    user.countryId = req.body.countryId;
    company.name = req.body.empresa;
    company.urlImage = 'https://s3.amazonaws.com/easymaq-companies/aviso_home.png';
    Company.create(company, (err, comp) => {
      if (err) {
        return res.status(500).json({
          err: err,
          message: 'Error al crear company'
        });
      }
      user.companyId = comp.id;
      newPlan.companyId = comp.id;
      Usuario.create(user, (err, result) => {
        if (err) {
          return res.status(500).json({
            err: err,
            message: 'Error al guardar datos'
          });
        }
        /* let message = { email: result.email }
        let renderer = server.loopback.template(path.resolve(__dirname, '../../server/views/welcome.ejs'));
        let html_body = renderer(message);*/
        transporter.sendMail({
          from: '"Admin Easymaq" <admin@easymaq.com>',
          to: result.email,
          subject: 'Easymaq',
          html: compiledTemplate.render({ nombre: req.body.email })
        }, function (error, response) {
          if (error) {
            return res.status(500).json({
              err: error,
              msg: 'Error al enviar email'
            });
          }
          Plan.create(newPlan, (err, plan) => {
            if (err) return res.status(500).json({
              err: err,
              msg: 'Error al crear plan'
            });
            plan.total = plan.simple + plan.destacado + plan.premium;
            plan.save((err) => {
              if (err) return res.status(500).json({
                err: err,
                msg: 'Error al crear plan'
              });
              return res.status(200).json(result);
            });
          });
        });
      });
    });
  });

  router.delete('/usuario-delete/:id', (req, res) => {
    let id = req.params.id;
    Usuario.destroyById(id, (err) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      return res.status(200).json({
        status: 200,
        message: 'Usuario eliminada eliminado'
      });
    });
  });

  router.post('/usuarios/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    Usuario.findOne({
      where: {
        email: email
      },
      include: [
        {
          relation: 'company'
        }, {
          relation: 'favorites'
        }
      ]
    }, (err, user) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error en login'
        });
      }
      if (!user) {
        return res.status(500).json({
          msg: 'email incorrecto',
          err: err
        });
      }
      console.log('user: ', user.toJSON());
      user.hasPassword(password, (err, match) => {
        if (err) {
          return res.status(500).json({
            msg: 'Error al logear usuario',
            err: err
          });
        }
        if (!match) {
          return res.status(500).json({
            msg: 'Contraseña incorrecta',
            err: err
          });
        } else {
          user = user.toJSON();
          return res.status(200).json(user);
        }
      });
    });
  });

  router.delete('/usuarios/:id', (req, res) => {
    let id = req.params.id;
    Usuario.findById(id, (err, usuario) => {
      if (err || !usuario) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      usuario.status = 2;
      usuario.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al eliminar'
        });
        return res.status(200).json({
          status: 200,
          message: 'Usuario eliminado'
        });
      })
    });
  });

  router.put('/usuarios/:id', (req, res) => {
    let id = req.params.id;
    let email = req.body.email;
    let home = req.body.home;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let emailAlternativo = req.body.emailAlternativo;
    let gender = req.body.gender;
    let dni = req.body.dni;
    let age = req.body.age;
    let dateBirthday = req.body.dateBirthday;
    let phone01 = req.body.phone01;
    let phone02 = req.body.phone02;
    let occupation = req.body.occupation;
    let urlPhoto = req.body.urlPhoto;
    let opLinkedin = req.body.opLinkdin;
    let opFacebook = req.body.opFacebook;
    let opPresentacion = req.body.opPresentacion;
    let uDepartamento = req.body.uDepartamento;
    let uProvincia = req.body.uProvincia;
    let uDistrito = req.body.uDistrito;
    let uDireccion = req.body.uDireccion;
    let recibeInfo = req.body.recibeInfo;
    let emNombre = req.body.emNombre;
    let emLogo = req.body.emLogo;
    let emRuc = req.body.emRuc;
    let rkpuStarTotal = req.body.rkpuStarTotal;
    let rkpuStarFive = req.body.rkpuStarFive;
    let rkpuStarFour = req.body.rkpuStarFour;
    let rkpuStarThree = req.body.rkpuStarThree;
    let rkpuStarTwo = req.body.rkpuStarTwo;
    let rkpuStarOne = req.body.rkpuStarOne;
    let rkopStarTotal = req.body.rkopStarTotal;
    let rkopStarFive = req.body.rkopStarFive;
    let rkopStarFour = req.body.rkopStarFour;
    let rkopStarThree = req.body.rkopStarThree;
    let rkopStarTwo = req.body.rkopStarTwo;
    let rkopStarOne = req.body.rkopStarOne;
    let status = req.body.status;

    let opActive = req.body.opActive;
    let emActive = req.body.emActive;

    let countryId = req.body.countryId;
    let companyId = req.body.companyId;

    Usuario.findById(id, (err, usuario) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar usuario'
      });
      if (!usuario) {
        return res.status(404).json({
          status: 404,
          message: 'Usuario no encontrado'
        });
      }
      if (home) {
        usuario.home = home;
      }
      if (email) {
        usuario.email = email;
      }
      if (firstName) {
        usuario.firstName = firstName;
      }
      if (lastName) {
        usuario.lastName = lastName;
      }
      if (emailAlternativo) {
        usuario.emailAlternativo = emailAlternativo;
      }
      if (gender) {
        usuario.gender = gender;
      }
      if (dni) {
        usuario.dni = dni;
      }
      if (age) {
        usuario.age = age;
      }
      if (dateBirthday) {
        usuario.dateBirthday = dateBirthday;
      }
      if (phone01) {
        usuario.phone01 = phone01;
      }
      if (phone02) {
        usuario.phone02 = phone02;
      }
      if (occupation) {
        usuario.occupation = occupation;
      }
      if (urlPhoto) {
        usuario.urlPhoto = urlPhoto;
      }
      if (opActive) {
        usuario.opActive = opActive;
      }
      if (opLinkedin) {
        usuario.opLinkedin = opLinkedin;
      }
      if (opFacebook) {
        usuario.opFacebook = opFacebook;
      }
      if (opPresentacion) {
        usuario.opPresentacion = opPresentacion;
      }
      if (uDepartamento) {
        usuario.uDepartamento = uDepartamento;
      }
      if (uProvincia) {
        usuario.uProvincia = uProvincia;
      }
      if (uDistrito) {
        usuario.uDistrito = uDistrito;
      }
      if (uDireccion) {
        usuario.uDireccion = uDireccion;
      }
      if (recibeInfo) {
        usuario.recibeInfo = recibeInfo;
      }
      if (emActive) {
        usuario.emActive = emActive;
      }
      if (emNombre) {
        usuario.emNombre = emNombre;
      }
      if (emLogo) {
        usuario.emLogo = emLogo;
      }
      if (emRuc) {
        usuario.emRuc = emRuc;
      }
      if (rkpuStarTotal) {
        usuario.rkpuStarTotal = rkpuStarTotal;
      }
      if (rkpuStarFive) {
        usuario.rkpuStarFive = rkpuStarFive;
      }
      if (rkpuStarFour) {
        usuario.rkpuStarFour = rkpuStarFour;
      }
      if (rkpuStarThree) {
        usuario.rkpuStarThree = rkpuStarThree;
      }
      if (rkpuStarTwo) {
        usuario.rkpuStarTwo = rkpuStarTwo;
      }
      if (rkpuStarOne) {
        usuario.rkpuStarOne = rkpuStarOne;
      }
      if (rkopStarTotal) {
        usuario.rkopStarTotal = rkopStarTotal;
      }
      if (rkopStarFive) {
        usuario.rkopStarFive = rkopStarFive;
      }
      if (rkopStarFour) {
        usuario.rkopStarFour = rkopStarFour;
      }
      if (rkopStarThree) {
        usuario.rkopStarThree = rkopStarThree;
      }
      if (rkopStarTwo) {
        usuario.rkopStarTwo = rkopStarTwo;
      }
      if (rkopStarOne) {
        usuario.rkopStarOne = rkopStarOne;
      }
      if (status) {
        usuario.status = status;
      }
      if (companyId) {
        usuario.companyId = companyId;
      }
      if (countryId) {
        usuario.countryId = countryId;
      }
      usuario.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al actualizar Usuario'
        });
        return res.status(200).json(usuario);
      });
    });
  });

  server.use(router);

}
