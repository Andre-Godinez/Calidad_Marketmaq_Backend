'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Category = server.models.Category;

  /*var categories = require('../../category.json');*/

  router.delete('/categories/:id', (req, res) => {
    let id = req.params.id;
    Category.findById(id, (err, category) => {
      if (err || !category) return res.status(500).json({
        status: 500,
        message: 'Error al eliminar'
      });
      category.status = 2;
      category.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al eliminar'
        });
        return res.status(200).json({
          status: 200,
          message: 'Categoria eliminada'
        });
      })
    });
  });

  router.put('/categories/:id', (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let description = req.body.description;
    let status = req.body.status;
    Category.findById(id, (err, category) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar categoria'
      });
      if (!category) {
        return res.status(404).json({
          status: 404,
          message: 'Categoria no encontrada'
        });
      }
      if (name) {
        category.name = name;
      }
      if (description) {
        category.description = description;
      }
      if (status) {
        category.status = status;
      }
      category.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al actualizar categoria'
        });
        return res.status(200).json(category);
      });
    });
  });

  server.use(router);

}
