'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Brand = server.models.Brand;

  /*var categories = require('../../category.json');*/

  router.get('/brands', (req, res) => {
    Brand.find({
      order: 'name ASC',
      include: {
        relation: 'publications'
      }
    }, (err, brands) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al encontrar brands'
      });
      var arr = [];
      brands = brands.map((obj) => obj.toJSON());
      brands.forEach((obj) => {
        let newBrand = {
          id: obj.id,
          name: obj.name,
          urlImage: obj.urlImage,
          description: obj.description,
          priority: obj.priority,
          status: obj.status,
          cant: obj.publications.length
        }
        arr.push(newBrand);
      })
      return res.status(200).json(arr);
    });
  });

  router.delete('/brands/:id', (req, res) => {
    let id = req.params.id;
    Brand.findById(id, (err, brand) => {
      if (err || !brand) return res.status(500).json({
        status: 500,
        message: 'Error al en borrar brand'
      });
      brand.status = 2;
      brand.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al eliminar Brand'
        });
        return res.status(200).json({
          status: 200,
          message: 'Brand eliminado'
        });
      })
    });
  });

  router.delete('/brands-delete/:id', (req, res) => {
    let id = req.params.id;
    Brand.destroyById(id, (err) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al en borrar brand'
      });
      return res.status(200).json({
        status: 200,
        message: 'Marca eliminada '
      });
    });
  });

  router.put('/brands/:id', (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let description = req.body.description;
    let urlImage = req.body.urlImage;
    let priority = req.body.priority;
    let status = req.body.status;
    Brand.findById(id, (err, brand) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar brand'
      });
      if (!brand) {
        return res.status(404).json({
          status: 404,
          message: 'Brand no encontrado'
        });
      }
      if (name) {
        brand.name = name;
      }
      if (description) {
        brand.description = description;
      }
      if (urlImage) {
        brand.urlImage = urlImage;
      }
      if (priority) {
        brand.priority = priority;
      }
      if (status) {
        brand.status = status;
      }
      brand.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al actualizar brand'
        });
        return res.status(200).json(brand);
      });
    });
  });

  server.use(router);

}
