'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Favorite = server.models.Favorite;

  router.post('/favorites', (req, res) => {
    let usuarioId = req.body.usuarioId;
    let publicationId = req.body.publicationId;
    Favorite.findOne({
      where: {
        and: [{ usuarioId: usuarioId }, { publicationId: publicationId }]
      }
    }, (err, favorite) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error en la base de datos'
        });
      } else if (!favorite) {
        Favorite.create({
          usuarioId: usuarioId,
          publicationId: publicationId,
          dateCreated: new Date()
        }, (err, fav) => {
          if (err) {
            return res.status(500).json({
              err: err,
              msg: 'Error al crear favorito'
            });
          } else {
            return res.status(201).json(fav);
          }
        });
      } else {
        return res.status(200).json(favorite);
      }
    });
  });

  router.delete('/favorites/:id', (req, res) => {
    let id = req.params.id;
    Favorite.destroyById(id, (err) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al eliminar'
        });
      } else {
        return res.status(200).json({
          err: err,
          msg: 'Eliminado con exito'
        });
      }
    });
  });

  server.use(router);

}
