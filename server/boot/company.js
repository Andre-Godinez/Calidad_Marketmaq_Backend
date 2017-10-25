'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Company = server.models.Company;
  var Publication = server.models.Publication;
  var Usuario = server.models.Usuario;

  /* EMPRESAS PERMITIDAS */
  router.get('/companies-enabled', (req, res) => {
    let id = req.query.idCountry
    Usuario.find({
      where: {
        and: [{
          countryId: id
        }, {
          home: 1
        }]
      },
      include: {
        relation: 'company'
      }
    }, (err, result) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al pedir empresas'
      });
      console.log('result: ', result);
      result = result.filter((obj) => obj.company)
        .map((obj) => obj.toJSON());
      console.log('result1: ', result);

      let empresas = [];
      result.forEach((obj) => {
        empresas.push(obj.company);
      });

      empresas = empresas.sort((a, b) => {
        let nameA = a.name.toLowerCase();
        let nameB = b.name.toLowerCase();
        if (nameA < nameB) //sort string ascending
          return -1;
        if (nameA > nameB)
          return 1;
        return 0; //default return value (no sorting)
      });
      return res.status(200).json(empresas);
    });
  });

  /**
   * VERIFICA SI LA URLPERFIL YA EXISTE
   */
  router.get('/companies-urlperfil/:urlPerfil', (req,res) => {
    let urlPerfil = req.params.urlPerfil;
    Company.findOne({
      where: {
        urlPerfil: urlPerfil
      }
    }, (err, instance) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar Company'
      });
      if(!instance) {
        return res.status(200).json({
          exists: 0
        })
      } else {
        return res.status(200).json({
          exists: 1
        })
      }
    })
  });

  /* BORRAS COMPAÑIA SOLO CAMBIAS DE STATUS */
  router.delete('/companies/:id', (req, res) => {
    let id = req.params.id;
    Company.findById(id, (err, company) => {
      if (err || !company) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      company.status = 2;
      company.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al eliminar'
        });
        return res.status(200).json({
          status: 200,
          message: 'Empresa eliminada'
        });
      })
    });
  });

  /* ELIMINAS DE LA BASE DE DATOS */
  router.delete('/company-delete/:id', (req, res) => {
    let id = req.params.id;
    Company.destroyById(id, (err) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      return res.status(200).json({
        status: 200,
        message: 'Empresa eliminada eliminado'
      });
    });
  });

  /**
   * RANKING DE EMPRESAS POR PUBLICACIONES CON ESTRELLAS
   */
  router.get('/company-rank/:companyId', (req, res) => {
    let companyId = req.params.companyId;
    var query = {
      where: {
        and: [
          { companyId: companyId }
        ]
      }
    };
    Publication.find(query, (err, result) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar publicacion',
        err: err
      });
      let ntotal = result.length;
      let temp = result.filter((obj) => {
        if (obj.status == 1) return true;
        return false;
      });
      let nactivos = temp.length;
      result = result.filter((obj) => {
        if (obj.rkStarTotal) {
          if (obj.rkStarTotal > 0) return true;
          else return false;
        }
        return false;
      });
      if(result.length > 0) {
        let ranking = 0;
        for (let pub of result) {
          ranking += pub.rkStarTotal;
        }
        ranking = ranking / result.length;
        return res.status(200).json({
          rankCompany: ranking,
          pubTotales: ntotal,
          pubActivos: nactivos
        });
      } else {
        return res.status(200).json({
          rankCompany: 0,
          pubTotales: ntotal,
          pubActivos: nactivos
        });
      }
    })
  })

  /* TE DEVUELVE LA EMPRESA POR SU URL */
  router.get('/company-url', (req, res) => {
    let name = req.query.name;
    Company.findOne({
      where: {
        urlPerfil: name
      }
    }, (err, company) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: 'Error al buscar Empresa'
        })
      } else if (!company) {
        if (err) return res.status(500).json({
          status: 500,
          message: 'No existe empresa'
        });
      } else {
        return res.status(200).json(company);
      }
    });
  });

  /* EDITAS UNA EMPRESA POR SU ID */
  router.put('/companies/:id', (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let description = req.body.description;
    let ruc = req.body.ruc;
    let website = req.body.website;
    let contact = req.body.contact;
    let phone = req.body.phone;
    let priority = req.body.priority;
    let urlImage = req.body.urlImage;
    let urlPerfil = req.body.urlPerfil;
    let banner = req.body.banner;
    let direccion = req.body.direccion;
    let facebook = req.body.facebook;
    let twitter = req.body.twitter;
    let linkedin = req.body.linkedin;
    let location = req.body.location;
    let status = req.body.status;
    let active = req.body.active;
    let enabled = req.body.enabled;
    let uDepartamento = req.body.uDepartamento;
    let uProvincia = req.body.uProvincia;
    let uDistrito = req.body.uDistrito;
    let countryId = req.body.countryId;
    Company.findById(id, (err, company) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar Empresa'
      });
      if (!company) {
        return res.status(404).json({
          status: 404,
          message: 'Empresa no encontrado'
        });
      }
      if (name) {
        company.name = name;
      }
      if (description) {
        company.description = description;
      }
      if (ruc) {
        company.ruc = ruc;
      }
      if (website) {
        company.website = website;
      }
      if (contact) {
        company.contact = contact;
      }
      if (phone) {
        company.phone = phone;
      }
      if (priority) {
        company.priority = priority;
      }
      if (urlImage) {
        company.urlImage = urlImage;
      }
      if (urlPerfil) {
        company.urlPerfil = urlPerfil;
      }
      if (banner) {
        company.banner = banner;
      }
      if (direccion) {
        company.direccion = direccion;
      }
      if (facebook) {
        company.facebook = facebook;
      }
      if (twitter) {
        company.twitter = twitter;
      }
      if (linkedin) {
        company.linkedin = linkedin;
      }
      console.log('location: ', location);
      if (typeof (location.lat) === 'number' && typeof (location.lng) === 'number') {
        company.location = location;
      }
      if (status) {
        company.status = status;
      }
      if (active) {
        company.active = active;
      }
      if (enabled) {
        company.enabled = enabled;
      }
      if (uDepartamento) {
        company.uDepartamento = uDepartamento;
      }
      if (uProvincia) {
        company.uProvincia = uProvincia;
      }
      if (uDistrito) {
        company.uDistrito = uDistrito;
      }
      if (countryId) {
        company.countryId = countryId;
      }
      company.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al actualizar Empresa'
        });
        return res.status(200).json(company);
      });
    });
  });

  server.use(router);

}
