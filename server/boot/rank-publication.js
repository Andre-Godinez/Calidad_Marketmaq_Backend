'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var rankPublication = server.models.RankPublication;
  var Publication = server.models.Publication;

  router.post('/rank-publication/one', (req, res) => {
    let usuarioId = req.body.usuarioId;
    let publicationId = req.body.publicationId;
    rankPublication.findOne({
      where: {
        and: [{
          usuarioId: usuarioId,
        }, {
          publicationId: publicationId
        }]
      }
    }, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al crear ranking'
        });
      }
      if (!result) {
        return res.status(500).json({
          err: err,
          msg: 'No existe el ranking'
        });
      }
      return res.status(200).json(result);
    });
  });

  router.post('/rank-publication', (req, res) => {
    let usuarioId = req.body.usuarioId;
    let publicationId = req.body.publicationId;
    let title = req.body.title;
    let description = req.body.description;
    let rankStar = req.body.rankStar;
    let newRankPublication = {
      usuarioId: req.body.usuarioId,
      publicationId: req.body.publicationId,
      title: req.body.title,
      description: req.body.description,
      rankStar: req.body.rankStar
    }
    console.log('new: ', newRankPublication);

    rankPublication.findOne({
      where: {
        and: [{
          usuarioId: usuarioId,
        }, {
          publicationId: publicationId
        }]
      }
    }, (err, result1) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al crear ranking'
        });
      }
      if (!result1) {
        console.log('entra: ', result1);
        rankPublication.create(newRankPublication, (err, result) => {
          if (err) {
            return res.status(500).json({
              err: err,
              msg: 'Error al crear ranking'
            });
          }
          console.log()
          Publication.findById(result.publicationId, (err, publ) => {
            if (err) {
              return res.status(500).json({
                err: err,
                msg: 'Error find publication'
              });
            }
            if (!publ) {
              return res.status(500).json({
                err: err,
                msg: 'No existe la publicacion'
              });
            }
            if (!publ.rkStarOne) {
              publ.rkStarOne = 0;
            }
            if (!publ.rkStarTwo) {
              publ.rkStarTwo = 0;
            }
            if (!publ.rkStarThree) {
              publ.rkStarThree = 0;
            }
            if (!publ.rkStarFour) {
              publ.rkStarFour = 0;
            }
            if (!publ.rkStarFive) {
              publ.rkStarFive = 0;
            }
            switch (result.rankStar) {
              case 1:
                publ.rkStarOne++;
                break;
              case 2:
                publ.rkStarTwo++;
                break;
              case 3:
                publ.rkStarThree++;
                break;
              case 4:
                publ.rkStarFour++;
                break;
              case 5:
                publ.rkStarFive++;
                break;
            }
            let total = publ.rkStarOne + publ.rkStarTwo + publ.rkStarThree + publ.rkStarFour + publ.rkStarFive;
            publ.rkStarTotal = (publ.rkStarOne * 1 + publ.rkStarTwo * 2 + publ.rkStarThree * 3 + publ.rkStarFour * 4 + publ.rkStarFive * 5) / total;
            publ.save((err) => {
              if (err) {
                return res.status(500).json({
                  err: err,
                  msg: 'Error al actualizar publication'
                });
              }
              return res.status(200).json(publ);
            });
          });
        });
      } else {
        result1.title = title;
        result1.description = description;
        result1.rankStar = rankStar;
        result1.save((err) => {
          if (err) {
            return res.status(500).json({
              err: err,
              msg: 'Error al updatear ranking'
            });
          }
          Publication.findById(result1.publicationId, (err, publ) => {
            if (err) {
              return res.status(500).json({
                err: err,
                msg: 'Error find publication'
              });
            }
            if (!publ) {
              return res.status(500).json({
                err: err,
                msg: 'No existe la publicacion'
              });
            }
            if (!publ.rkStarOne) {
              publ.rkStarOne = 0;
            }
            if (!publ.rkStarTwo) {
              publ.rkStarTwo = 0;
            }
            if (!publ.rkStarThree) {
              publ.rkStarThree = 0;
            }
            if (!publ.rkStarFour) {
              publ.rkStarFour = 0;
            }
            if (!publ.rkStarFive) {
              publ.rkStarFive = 0;
            }
            switch (result1.rankStar) {
              case 1:
                publ.rkStarOne++;
                break;
              case 2:
                publ.rkStarTwo++;
                break;
              case 3:
                publ.rkStarThree++;
                break;
              case 4:
                publ.rkStarFour++;
                break;
              case 5:
                publ.rkStarFive++;
                break;
            }
            let total = publ.rkStarOne + publ.rkStarTwo + publ.rkStarThree + publ.rkStarFour + publ.rkStarFive;
            publ.rkStarTotal = (publ.rkStarOne * 1 + publ.rkStarTwo * 2 + publ.rkStarThree * 3 + publ.rkStarFour * 4 + publ.rkStarFive * 5) / total;
            publ.save((err) => {
              if (err) {
                return res.status(500).json({
                  err: err,
                  msg: 'Error al actualizar publication'
                });
              }
              return res.status(200).json(publ);
            });
          });
        });
      }
      /* return res.status(200).json(result); */
    });
  });

  server.use(router);

}
