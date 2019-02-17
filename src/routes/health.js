const express = require('express');

function buildHealthRouter() {
  const router = express.Router();

  router.get('/', function (req, res) {
    res.json({
      'status': 'ok'
    });
  });

  return router;
}

module.exports = buildHealthRouter;