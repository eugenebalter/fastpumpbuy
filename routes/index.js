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
  if (req.body.exch_type == "1") {
    bittrex.buy(req.body, res)
  } else {
    binance.buy(req.body, res)
  }
});

bittrex.init()
binance.init()

module.exports = router;