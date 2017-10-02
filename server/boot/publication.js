'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Publication = server.models.Publication;
  var Company = server.models.Company;

  router.post('/publications', (req, res) => {
    let newPublication = req.body;
    if (typeof (newPublication.location.lat) !== 'number') {
      newPublication.location = {
        lat: -12.0872234,
        lng: -76.99529239999998
      }
      newPublication.uDireccion = 'Av. Javier Prado Este 2922, Cercado de Lima 15037, Perú';
    }
    newPublication.plan = 'simple';
    Publication.create(newPublication, (err, publ) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al crear Publicacion'
        })
      }
      return res.status(201).json(publ);

    });
  });

  router.get('/publications', (req, res) => {
    var brandId = req.query.brandId;
    var companyId = req.query.companyId;
    var countryId = req.query.countryId;
    var usuarioId = req.query.usuarioId;
    var categoryId = req.query.categoryId;
    var condition = req.query.condition;
    var type = req.query.type;
    var order = req.query.order;
    var text = req.query.query;
    // FILTROS SINPLES O DESTACADOS
    var card = req.query.card

    var limit = req.query.limit;
    var page = req.query.page;

    var query = {
      where: {
        and: [{
          status: 1
        }]
      },
      include: [{
        relation: 'company'
      }, {
        relation: 'brand'
      }, {
        relation: 'category'
      }]
    };
    if (brandId) {
      query.where.and.push({ brandId: brandId });
    }
    if (companyId) {
      query.where.and.push({ companyId: companyId });
    }
    if (countryId) {
      query.where.and.push({ countryId: countryId });
    }
    if (usuarioId) {
      query.where.and.push({ usuarioId: usuarioId });
    }
    if (categoryId) {
      query.where.and.push({ categoryId: categoryId });
    }
    if (condition) {
      query.where.and.push({ condicion: condition });
    }
    if (type) {
      query.where.and.push({ operacion: type });
    }
    if (card && (card === 'simple' || card === 'destacado')) {
      query.where.and.push({ plan: card });
    }
    if (order) {
      if (order === 'ASC' || order === 'DESC') {
        query.order = `dateCreated ${order}`;
      }
    }
    if (query.where.and.length === 0) {
      delete query.where;
    }
    page = !page ? null : ((JSON.parse(page) <= 0) ? null : JSON.parse(page));
    limit = !limit ? null : ((JSON.parse(limit) < 5) ? null : JSON.parse(limit));
    if (limit) {
      query.limit = limit;
    }
    if (page && limit) {
      query.skip = ((page - 1) * limit);
    }
    console.log(query);

    if (card && (card === 'simple' || card === 'destacado')) {
      Publication.find(query, (err, result) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al buscar publicacion',
          err: err
        });
        result = result.map((obj) => {
          obj = obj.toJSON();
          if (!obj.category || !obj.brand || !obj.company) {
            console.log('obj: ', obj);
          }
          obj.text = ('' + obj.category.name + ' ' + obj.brand.name + ' ' + obj.company.name).toLowerCase();
          return obj;
        });
        result = result.filter((obj) => {
          if (text) {
            return obj.text.search(text) !== -1;
          }
          return true;
        })
        return res.status(200).json(result);
      });
    } else {
      query.where.and.push({ plan: 'destacado' });
      Publication.find(query, (err, result1) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al buscar publicacion',
          err: err
        });
        query.where.and.pop();
        query.where.and.push({ plan: 'simple' });
        Publication.find(query, (err, result2) => {
          if (err) return res.status(500).json({
            status: 500,
            message: 'Error al buscar publicacion',
            err: err
          });
          let result = result1.concat(result2);
          result = result.map((obj) => {
            obj = obj.toJSON();
            if (!obj.category || !obj.brand || !obj.company) {
              console.log('obj: ', obj);
            }
            obj.text = ('' + obj.category.name + ' ' + obj.brand.name + ' ' + obj.company.name).toLowerCase();
            return obj;
          });
          result = result.filter((obj) => {
            if (text) {
              return obj.text.search(text) !== -1;
            }
            return true;
          })
          return res.status(200).json(result);
        });
      });
    }

    /* Publication.find(query, (err, result) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar publicacion',
        err: err
      });
      result = result.map((obj) => {
        obj = obj.toJSON();
        if (!obj.category || !obj.brand || !obj.company) {
          console.log('obj: ', obj);
        }
        obj.text = ('' + obj.category.name + ' ' + obj.brand.name + ' ' + obj.company.name).toLowerCase();
        return obj;
      });
      result = result.filter((obj) => {
        if (text) {
          return obj.text.search(text) !== -1;
        }
        return true;
      })
      return res.status(200).json(result);
    }); */
  });

  router.get('/publications-admin', (req, res) => {
    var brandId = req.query.brandId;
    var companyId = req.query.companyId;
    var countryId = req.query.countryId;
    var usuarioId = req.query.usuarioId;
    var categoryId = req.query.categoryId;
    var condition = req.query.condition;
    var type = req.query.type;
    var order = req.query.order;
    var text = req.query.query;

    var limit = req.query.limit;
    var page = req.query.page;

    var query = {
      where: {
        and: []
      },
      include: [{
        relation: 'company'
      }, {
        relation: 'brand'
      }, {
        relation: 'category'
      }]
    };
    if (brandId) {
      query.where.and.push({ brandId: brandId });
    }
    if (companyId) {
      query.where.and.push({ companyId: companyId });
    }
    if (countryId) {
      query.where.and.push({ countryId: countryId });
    }
    if (usuarioId) {
      query.where.and.push({ usuarioId: usuarioId });
    }
    if (categoryId) {
      query.where.and.push({ categoryId: categoryId });
    }
    if (condition) {
      query.where.and.push({ condicion: condition });
    }
    if (type) {
      query.where.and.push({ operacion: type });
    }
    if (order) {
      if (order === 'ASC' || order === 'DESC') {
        query.order = `dateCreated ${order}`;
      }
    }
    if (query.where.and.length === 0) {
      delete query.where;
    }
    page = !page ? null : ((JSON.parse(page) <= 0) ? null : JSON.parse(page));
    limit = !limit ? null : ((JSON.parse(limit) < 1) ? null : JSON.parse(limit));
    if (limit) {
      query.limit = limit;
    }
    if (page && limit) {
      query.skip = ((page - 1) * limit);
    }
    console.log(query);

    Publication.find(query, (err, result) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar publicacion',
        err: err
      });
      result = result.map((obj) => {
        obj = obj.toJSON();
        obj.text = ('' + obj.category.name + ' ' + obj.brand.name + ' ' + obj.company.name).toLowerCase();
        return obj;
      });
      result = result.filter((obj) => {
        if (text) {
          return obj.text.search(text) !== -1;
        }
        return true;
      })
      return res.status(200).json(result);
    });
  });

  router.get('/publication-null', (req, res) => {
    Publication.find({}, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'error al pedir oublicacions'
        });
      }
      result = result.map((obj) => obj.toJSON()).filter((obj) => !obj.urlImages);
      return res.status(200).json(result);
    });
  })

  router.get('/publication-all', (req, res) => {
    Publication.find({}, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'error al pedir oublicacions'
        });
      }
      result = result.map((obj) => obj.toJSON());
      return res.status(200).json(result);
    });
  })

  router.delete('/publications/:id', (req, res) => {
    let id = req.params.id;
    Publication.findById(id, (err, publication) => {
      if (err || !publication) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      publication.status = 2;
      publication.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al eliminar'
        });
        return res.status(200).json({
          status: 200,
          message: 'Publicación eliminada eliminado'
        });
      })
    });
  });

  router.delete('/publications-delete/:id', (req, res) => {
    let id = req.params.id;
    Publication.destroyById(id, (err) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      return res.status(200).json({
        status: 200,
        message: 'Publicación eliminada eliminado'
      });
    });
  });

  router.put('/publications/:id', (req, res) => {
    let id = req.params.id;
    console.log(req.body);
    let ctName = req.body.ctName;
    let ctLastName = req.body.ctLastName;
    let ctEmail = req.body.ctEmail;
    let ctPhone01 = req.body.ctPhone01;
    let ctPhone02 = req.body.ctPhone02;
    let ctHorario = req.body.ctHorario;
    let uDepartamento = req.body.uDepartamento;
    let uDistrito = req.body.uDistrito;
    let uProvincia = req.body.uProvincia;
    let uDireccion = req.body.uDireccion;
    let uReferencia = req.body.uReferencia;
    let prConsultar = req.body.prConsultar;
    let prTipoAlquiler = req.body.prTipoAlquiler;
    let prMoneda = req.body.prMoneda;
    let prPrecio = req.body.prPrecio;
    let prPrecioOferta = req.body.prPrecioOferta;
    let condicion = req.body.condicion;
    let age = req.body.age;
    let description = req.body.description;
    let horasMaquina = req.body.horasMaquina;
    let operacion = req.body.operacion;
    let urlImages = req.body.urlImages;
    let location = req.body.location;
    let plan = req.body.plan;
    let banner = req.body.banner;
    let dateStart = req.body.dateStart;
    let dateTerminated = req.body.dateTerminated;
    let dateUpdate = req.body.dateUpdate;
    let status = req.body.status;
    let modelo = req.body.modelo;

    let usuarioId = req.body.usuarioId;
    let categoryId = req.body.categoryId;
    let countryId = req.body.countryId;
    let companyId = req.body.companyId;
    let brandId = req.body.brandId;

    Publication.findById(id, (err, publication) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar publicacion'
      });
      if (!publication) {
        return res.status(404).json({
          status: 404,
          message: 'Publicacion no encontrada'
        });
      }
      if (ctName) {
        publication.ctName = ctName;
      }
      if (ctLastName) {
        publication.ctLastName = ctLastName;
      }
      if (ctEmail) {
        publication.ctEmail = ctEmail;
      }
      if (ctPhone01) {
        publication.ctPhone01 = ctPhone01;
      }
      if (ctPhone02) {
        publication.ctPhone02 = ctPhone02;
      }
      if (ctHorario) {
        publication.ctHorario = ctHorario;
      }
      if (uDepartamento) {
        publication.uDepartamento = uDepartamento;
      }
      if (uDistrito) {
        publication.uDistrito = uDistrito;
      }
      if (uDireccion) {
        publication.uDireccion = uDireccion;
      }
      if (uReferencia) {
        publication.uReferencia = uReferencia;
      }
      if (age) {
        publication.age = age;
      }
      if (prConsultar) {
        publication.prConsultar = prConsultar;
      }
      if (prTipoAlquiler) {
        publication.prTipoAlquiler = prTipoAlquiler;
      }
      if (prMoneda) {
        publication.prMoneda = prMoneda;
      }
      if (prPrecio) {
        publication.prPrecio = prPrecio;
      }
      if (prPrecioOferta) {
        publication.prPrecioOferta = prPrecioOferta;
      }
      if (condicion) {
        publication.condicion = condicion;
      }
      if (operacion) {
        publication.operacion = operacion;
      }
      if (urlImages) {
        publication.urlImages = urlImages;
      }
      if (location) {
        publication.location = location;
      }
      if (plan) {
        publication.plan = plan;
      }
      if (banner) {
        publication.banner = banner;
      }
      if (dateStart) {
        publication.dateStart = dateStart;
      }
      if (dateTerminated) {
        publication.dateTerminated = dateTerminated;
      }
      if (dateUpdate) {
        publication.dateUpdate = dateUpdate;
      }
      if (status) {
        publication.status = status;
      }
      if (usuarioId) {
        publication.usuarioId = usuarioId;
      }
      if (countryId) {
        publication.countryId = countryId;
      }
      if (brandId) {
        publication.brandId = brandId;
      }
      if (companyId) {
        publication.companyId = companyId;
      }
      if (categoryId) {
        publication.categoryId = categoryId;
      }

      if (!publication.categoryId || !publication.brandId
        || !publication.countryId || !publication.usuarioId || !publication.companyId
      ) {
        if (err) return res.status(500).json({
          status: 500,
          err: 'Faltan datos requeridos',
          message: 'Error al actualizar Publicacion'
        });
      }

      publication.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          err: err,
          message: 'Error al actualizar Publicacion'
        });
        return res.status(200).json(publication);
      });
    });
  });

  router.get('/publications-plan/:id', (req, res) => {
    let id = req.params.id;
    /*
      @type: solo 2 valores: 'simple' y 'destacado'
    */
    let type = req.query.type;
    Publication.findById(id, {
      include: {
        relation: 'company',
        scope: {
          include: {
            relation: 'plans',
            scope: {
              order: 'dateCreated DESC',
              where: {
                status: 1
              },
              limit: 1
            }
          }
        }
      }
    }, (err, publication) => {
      if (err) return res.status(500).json({
        err: err,
        msg: 'Error al actualizar publicación'
      });
      let publication1 = publication.toJSON();
      let plans = publication1.company.plans;
      if (plans.length === 0) {
        return res.status(500).json({
          msg: 'La empresa no cuenta con ningun plan'
        });
      } else {
        let plan = plans[0];
        let query1 = {
          where: {
            and: [{
              status: 1
            }, {
              companyId: publication.companyId
            }]
          }
        }
        if (type === 'simple') {
          query1.where.and.push({
            plan: 'simple'
          });
          Publication.find(query1, (err, result) => {
            if (err) return res.status(500).json({
              err: err,
              msg: 'Error al actualizar publicacion'
            });
            /* comparamos que el  numero de publicaciones simples sea menor que el de su plan */
            if (plan.simple > result.length) {
              if (publication.plan === 'simple') {
                publication.plan = null;
              } else {
                publication.plan = 'simple';
              }
              publication.save((err) => {
                if (err) return res.status(500).json({
                  err: err,
                  msg: 'Error al actualizar publicacion'
                });
                return res.status(200).json(publication)
              });
            } else {
              return res.status(500).json({
                msg: 'Tienes el máximo numero de publicaciones simples permitidas'
              });
            }
          });
        } else if (type === 'destacado') {
          query1.where.and.push({
            plan: 'destacado'
          });
          Publication.find(query1, (err, result) => {
            if (err) return res.status(500).json({
              err: err,
              msg: 'Error al actualizar publicacion'
            });
            /* comparamos que el  numero de publicaciones simples sea menor que el de su plan */
            if (plan.destacado > result.length) {
              if (publication.plan === 'destacado') {
                publication.plan = null;
              } else {
                publication.plan = 'destacado';
              }
              publication.save((err) => {
                if (err) return res.status(500).json({
                  err: err,
                  msg: 'Error al actualizar publicacion'
                });
                return res.status(200).json(publication)
              });
            } else {
              return res.status(500).json({
                msg: 'Tienes el máximo numero de publicaciones destacadas permitidas'
              });
            }
          });
        } else {
          return res.status(500).json({
            msg: 'Operacion inválida'
          });
        }
      }
    });
  });

  server.use(router);

}
