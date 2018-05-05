var express = require('express');
var router = express.Router();
const bittrex = require('../lib/bittrex')
const binance = require('../lib/binance')

/* GET home page. */

router.get('/subscribeBittrex', function(req, res, next) {
  bittrex.subscribe(res);
});
router.get('/subscribeBinance', function(req, res, next) {
  binance.subscribe(res);
});
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Buy bot'
  });
});

router.post('/buy', function(req, res, next) {
  switch (req.body.exch_type) {
    case "1":
      bittrex.buy(req.body, res)
      break
    default:
      binance.buy(req.body, res)
  }
});

router.post('/sell', function(req, res, next) {
  switch (req.body.exch_type) {
    case "1":
      bittrex.sell(req.body, res)
      break;
    default:
      binance.sell(req.body, res)
  }
});

module.exports = router;