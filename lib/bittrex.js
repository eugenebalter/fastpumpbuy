var bittrex = require('node-bittrex-api');
const config = require('../config');

bittrex.options({
  'apikey': config.bittrex_api.APIKEY,
  'apisecret': config.bittrex_api.APISECRET
});

var markets = {}
var MarketName
var buyPrice = 0
var buyQty = 0

exports.init = function() {
  bittrex.getmarketsummaries(function(res) {
    for (var i in res.result) {
      markets[res.result[i].MarketName] = res.result[i]
    }
    //    console.log(markets);
  });
}

exports.subscribe = function(res) {
  bittrex.getticker({
    market: MarketName
  }, function(tick) {
    if (tick) {
      var ask = tick.result.Bid.toString();
      console.log(ask)
      res.json({
        "price": ask,
        "dev": Math.trunc((ask / buyPrice) * 10000) / 10000
      })
    } else {
      res.json({
        "price": 0
      })
    }
  })
}

exports.buy = function(data, res) {
  try {
    MarketName = "BTC-" + data.coin.toUpperCase()
    var amountToBuy = Math.trunc((Number(data.btc_amount) / Number(markets[MarketName].Last)) * 1000) / 1000;
  } catch (e) {
    throw e;
  }

  if (data.test == "1") {
    bittrex.getticker({
      market: MarketName
    }, function(ticker) {
      buyPrice = ticker.result.Ask.toString();
      buyQty = amountToBuy
      res.json({
        "qty": amountToBuy,
        "price": buyPrice
      })
    })
  } else {
    var dat = {
      market: MarketName,
      quantity: amountToBuy,
      rate: Number(markets[MarketName].Last) * 2
    };
    bittrex.buylimit(dat, function(err, dat) {
      if (err) {
        return console.error(err);
        res.json({
          "error": err
        })

      }
      if (dat.success == true) {
        bittrex.getorder(dat.result.uuid, function(err, ord) {
          if (err) {
            return console.error(err);
            res.json({
              "error": err
            })

          }
          if (ord.success == true) {
            buyPrice = ord.result.Price
            buyQty = ord.result.Quantity
            res.json({
              "price": buyPrice,
              "qty": buyQty
            })

          }
        })
      } else {
        return console.error(dat.message);
        res.json({
          "error": "unsucsessfull buy"
        })
      }
    });
  }
}

exports.sell = function(data, res) {
  MarketName = "BTC-" + data.coin.toUpperCase()
  var dat = {
    market: MarketName,
    quantity: 0.01,
    rate: Number(markets[MarketName].Last) * 0.5
  };
  bittrex.selllimit(dat, function(err, dat) {
    console.log(dat);
    if (err) {
      return console.error(err);
      res.json({
        "error": err
      })

    }
    if (dat.success == true) {
      bittrex.getorder(dat.result.uuid, function(err, ord) {
        if (err) {
          return console.error(err);
          res.json({
            "error": err
          })

        }
        if (ord.success == true) {
          var Price = ord.result.Price
          var Qty = ord.result.Quantity
          res.json({
            "price": Price,
            "qty": Qty
          })

        }
      })
    } else {
      return console.error(dat.message);
      res.json({
        "error": "unsucsessfull sell"
      })
    }
  });
}