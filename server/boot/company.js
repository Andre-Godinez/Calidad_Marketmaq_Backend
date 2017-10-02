'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Company = server.models.Company;
  var Usuario = server.models.Usuario;

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

  router.put('/companies/:id', (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let ruc = req.body.ruc;
    let website = req.body.website;
    let contact = req.body.contact;
    let phone = req.body.phone;
    let priority = req.body.priority;
    let urlImage = req.body.urlImage;
    let status = req.body.status;
    let active = req.body.active;
    let enabled = req.body.enabled;
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
      if (status) {
        company.status = status;
      }
      if (active) {
        company.active = active;
      }
      if (enabled) {
        company.enabled = enabled;
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
