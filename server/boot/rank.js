'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Rank = server.models.Rank;

  router.post('/ranking/total/:id', (req, res) => {
    let id = req.params.id;
    /* type = 'empresa  'operario*/
    let tipe = req.body.type;
    Rank.find({
      where: {
        and: [{
          companyId: id
        }, {
          tipoRank: tipe
        }]
      }
    }, (err, ranks) => {
      if (err) return res.status(500).json({
        err: err,
        message: 'Error al buscar rankings de empresa'
      });
      ranks = ranks.map((obj) => obj.toJSON());
      let result = {
        uno: 0,
        dos: 0,
        tres: 0,
        cuatro: 0,
        cinco: 0
      }
      ranks.forEach((obj) => {
        switch (obj.rankStar) {
          case 1:
            result.uno++;
            break;
          case 2:
            result.dos++;
            break;
          case 3:
            result.tres++;
            break;
          case 4:
            result.cuatro++;
            break;
          case 5:
            result.cinco++;
            break;
        }
      });
      return res.status(200).json(result);
    });
  });

  router.put('/ranks/:id', (req, res) => {
    let id = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let tipoRank = req.body.tipoRank;
    let rankStar = req.body.rankStar;
    let usuarioId = req.body.usuarioId;
    let companyId = req.body.companyId;
    Rank.findById(id, (err, rank) => {
      if (err) return res.status(500).json({
        status: 500,
        message: 'Error al buscar rank'
      });
      if (!rank) {
        return res.status(404).json({
          status: 404,
          message: 'rank no encontrado'
        });
      }
      if (name) {
        rank.name = name;
      }
      if (title) {
        rank.title = title;
      }
      if (description) {
        rank.description = description;
      }
      if (description) {
        rank.description = description;
      }
      if (tipoRank) {
        rank.tipoRank = tipoRank;
      }
      if (rankStar) {
        rank.rankStar = rankStar;
      }
      if (usuarioId) {
        rank.usuarioId = usuarioId;
      }
      if (companyId) {
        rank.companyId = companyId;
      }
      rank.save((err) => {
        if (err) return res.status(500).json({
          status: 500,
          message: 'Error al actualizar rank'
        });
        return res.status(200).json(rank);
      });
    });
  });

  server.use(router);

}
