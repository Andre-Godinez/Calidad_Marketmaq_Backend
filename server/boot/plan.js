'use strict';

module.exports = function (server) {

  var router = server.loopback.Router();
  var Plan = server.models.Plan;
  var Company = server.models.Company;


  /* añadir la fecha por dias (REFACTORIZAR) */
  router.post('/plans', (req, res) => {
    let newPlan = req.body;
    newPlan.dateCreated = new Date();
    Plan.create(newPlan, (err, plan) => {
      if (err) return res.status(500).json({
        err: err,
        msg: 'Error al crear plan'
      });
      plan.total = plan.simple + plan.destacado + plan.premium;
      plan.save((err) => {
        if (err) return res.status(500).json({
          err: err,
          msg: 'Error al crear plan'
        });
        return res.status(201).json(plan);
      });
    });
  });

  router.put('/plans/:id', (req, res) => {
    let id = req.params.id;
    let price = req.body.price;
    let simple = req.body.simple;
    let destacado = req.body.destacado;
    let premium = req.body.premium;
    let status = req.body.status;
    let dateTerminated = req.body.dateTerminated;
    Plan.findById(id, (err, plan) => {
      if (err) return res.status(500).json({
        err: err,
        msg: 'Error al editar plan'
      });
      plan.price = price;
      plan.simple = simple;
      plan.destacado = destacado;
      plan.premium = premium;
      if (!status && (status === 1 || status === 2)) {
        plan.status = status;
      }
      plan.dateTerminated = dateTerminated;
      plan.save((err) => {
        if (err) return res.status(500).json({
          err: err,
          msg: 'Error al editar plan'
        });
        plan.total = plan.simple + plan.destacado + plan.premium;
        plan.save((err) => {
          if (err) return res.status(500).json({
            err: err,
            msg: 'Error al editar plan'
          });
          return res.status(200).json(plan);
        });
      });
    });
  });

  router.post('/plan-assign/:id', (req, res) => {
    let id = req.params.id;
    Plan.findById(id, (err, plan) => {
      if (err) return res.status(500).json({
        err: err,
        msg: 'Error al asignar plan'
      });
      plan.countryId = req.body.countryId;
      plan.companyId = req.body.companyId;
      plan.save((err) => {
        if (err) return res.status(500).json({
          err: err,
          msg: 'Error al editar plan'
        });
      });
    });
  });

  router.get('/plan-company/:id', (req, res) => {
    let id = req.params.id;
    Company.findById(id, {
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
    }, (err, company) => {
      company = company.toJSON();
      console.log(company);
      if (err) return res.status(500).json({
        err: err,
        msg: 'Error al pedir plan'
      });
      if (company.plans.length === 0) {
        return res.status(500).json({
          msg: 'La empresa no cuenta con ningun plan'
        });
      } else {
        return res.status(200).json(company.plans[0]);
      }
    });
  });

  server.use(router);

}
