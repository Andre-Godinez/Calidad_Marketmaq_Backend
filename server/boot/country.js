'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Country = server.models.Country;

  router.delete('/countries/:id', (req, res) => {
    let id = req.params.id;
    Country.findById(id, (err, country) => {
      if (err || !country) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      country.status = 2;
      country.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al eliminar'
        });
        return res.status(200).json({
          status: 200,
          message: 'Pais eliminado'
        });
      })
    });
  });

  router.put('/countries/:id', (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let code = req.body.code;
    let status = req.body.status;
    Country.findById(id, (err, country) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar pais'
      });
      if (!country) {
        return res.status(404).json({
          status: 404,
          message: 'Pais no encontrado'
        });
      }
      if (name) {
        country.name = name;
      }
      if (code) {
        country.code = code;
      }
      if (status) {
        country.status = status;
      }
      country.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al actualizar País'
        });
        return res.status(200).json(country);
      });
    });
  });

  server.use(router);

}
