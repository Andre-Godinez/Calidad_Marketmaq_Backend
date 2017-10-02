'use strict';

let moment = require('moment');

module.exports = function (server) {

  var router = server.loopback.Router();
  var Vistas = server.models.Vistas;

  let ONE_DAY = 1 * 24 * 60 * 60 * 1000;
  let ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  let ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

  router.post('/vistas', (req, res) => {
    let publicationId = req.body.publicationId;
    let date = new Date((new Date()).setHours(0, 0, 0, 0));
    console.log(date);
    Vistas.find({
      where: {
        publicationId: publicationId
      },
      order: 'dateCreated DESC',
      limit: 1
    }, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error en la base de datos'
        });
      } else if (result.length === 0) {
        let newVista = {
          dateCreated: date,
          count: 1,
          publicationId: publicationId
        }
        Vistas.create(newVista, (err, vista) => {
          if (err) {
            return res.status(500).json({
              err: err,
              msg: 'Error al crear vista'
            });
          } else {
            return res.status(201).json(vista);
          }
        });
      } else {
        let vista = result[0];
        if (date.getTime() === vista.dateCreated.getTime()) {
          vista.count++;
          vista.save((err) => {
            if (err) {
              return res.status(500).json({
                err: err,
                msg: 'Error al updatear vista'
              });
            } else {
              return res.status(200).json(vista);
            }
          });
        } else {
          let newVista = {
            dateCreated: date,
            count: 1,
            publicationId: publicationId
          }
          Vistas.create(newVista, (err, vista1) => {
            if (err) {
              return res.status(500).json({
                err: err,
                msg: 'Error al crear vista'
              });
            } else {
              return res.status(201).json(vista1);
            }
          });
        }
      }
    });
  });

  /* router.post('/vistas-publication/:id', (req, res) => { */
  router.post('/vistas-publication', (req, res) => {
    /* let id = req.params.id; */
    let dateStart = req.body.dateStart;
    let dateEnd = req.body.dateEnd;
    if (moment(dateStart).isValid() && moment(dateEnd).isValid()) {
      let inicio = moment(dateStart).startOf('day');
      let fin = moment(dateEnd).startOf('day');
      console.log(inicio.toISOString());
      console.log(fin.toISOString());
      if (inicio.diff(fin) >= 0) {
        return res.status(500).json({
          msg: 'La fecha de fin debe ser mayor que la fecha de inicio'
        });
      } else {
        let days = [];
        let total = fin.diff(inicio, 'days') + 1;
        console.log(total);
        for (let i = 0; i < total; i++) {
          let buffDay = moment(dateEnd).startOf('day');
          console.log('buddDay: ', buffDay);
          let buff;
          buff = buffDay.subtract(i, 'days');
          /* if (i === 0) {
            buff = buffDay;
          } else {
            buff = buffDay.day(`-${i - 1}`);
            buff = buffDay.day(`-${i}`);
          } */
          let obj = {
            name: buff.format('DD MMM'),
            date: buff.toISOString(),
            count: 0
          }
          days.push(obj);
        }
        console.log(days);
        console.log(inicio.toISOString());
        console.log(fin.toISOString());
        Vistas.find({
          where: {
            and: [
              /* { publicationId: id }, */
              { dateCreated: { gte: new Date(inicio.toISOString()) } },
              { dateCreated: { lte: new Date(fin.toISOString()) } }
            ]
          }
        }, (err, result) => {
          if (err) {
            return res.status(500).json({
              err: err,
              msg: 'Error al pedir vistas'
            });
          } else {
            console.log(result);
            for (let j = 0; j < days.length; j++) {
              for (let i = 0; i < result.length; i++) {
                if (moment(days[j].date).diff(moment(result[i].dateCreated)) === 0) {
                  days[j].count = result[i].count;
                  break;
                }
              }
            }
            return res.status(200).json(days);
          }
        });
      }
    } else {
      return res.status(500).json({
        msg: 'Formato de las fechas invalidos'
      });
    }
  });

  router.get('/vistas-publication-day/:id', (req, res) => {
    let date = new Date((new Date()).setHours(0, 0, 0, 0));
    console.log(date);
    let days = [];
    for (let i = 0; i < 1; i++) {
      let buff;
      if (i === 0) {
        buff = moment(date);
      } else {
        buff = moment(date).day(`-${i - 1}`);
      }
      let obj = {
        name: buff.format('DD MMM'),
        date: buff.toISOString(),
        count: 0
      }
      days.push(obj);
    }
    let id = req.params.id;
    Vistas.find({
      where: {
        publicationId: id,
        dateCreated: {
          gt: date - ONE_DAY
        }
      }
    }, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al pedir vistas'
        });
      } else {
        for (let j = 0; j < days.length; j++) {
          for (let i = 0; i < result.length; i++) {
            if (moment(days[j].date).diff(moment(result[i].dateCreated)) === 0) {
              days[j].count = result[i].count;
              break;
            }
          }
        }
        return res.status(200).json(days);
      }
    });
  });

  router.get('/vistas-publication-week/:id', (req, res) => {
    let date = new Date((new Date()).setHours(0, 0, 0, 0));
    let id = req.params.id;
    let days = [];
    for (let i = 0; i < 7; i++) {
      let buff;
      if (i === 0) {
        buff = moment(date);
      } else {
        buff = moment(date).day(`-${i - 1}`);
      }
      let obj = {
        name: buff.format('DD MMM'),
        date: buff.toISOString(),
        count: 0
      }
      days.push(obj);
    }
    Vistas.find({
      where: {
        publicationId: id,
        dateCreated: {
          gt: date - ONE_WEEK
        }
      }
    }, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al pedir vistas'
        });
      } else {

        for (let j = 0; j < days.length; j++) {
          for (let i = 0; i < result.length; i++) {
            if (moment(days[j].date).diff(moment(result[i].dateCreated)) === 0) {
              days[j].count = result[i].count;
              break;
            }
          }
        }

        return res.status(200).json(days);
      }
    });
  });

  router.get('/vistas-publication-month/:id', (req, res) => {
    let date = new Date((new Date()).setHours(0, 0, 0, 0));
    let days = [];
    for (let i = 0; i < 30; i++) {
      let buff;
      if (i === 0) {
        buff = moment(date);
      } else {
        buff = moment(date).day(`-${i - 1}`);
      }
      let obj = {
        name: buff.format('DD MMM'),
        date: buff.toISOString(),
        count: 0
      }
      days.push(obj);
    }
    console.log(days);
    let id = req.params.id;
    Vistas.find({
      where: {
        publicationId: id,
        dateCreated: {
          gt: date - ONE_MONTH
        }
      }
    }, (err, result) => {
      if (err) {
        return res.status(500).json({
          err: err,
          msg: 'Error al pedir vistas'
        });
      } else {

        for (let j = 0; j < days.length; j++) {
          for (let i = 0; i < result.length; i++) {
            if (moment(days[j].date).diff(moment(result[i].dateCreated)) === 0) {
              days[j].count = result[i].count;
              break;
            }
          }
        }

        /* return res.status(200).json(result); */
        return res.status(200).json(days);
      }
    });
  });

  server.use(router);

}
