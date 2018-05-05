const binancebot = require('node-binance-api');
const config = require('../config');

binancebot.options({
  APIKEY: config.binance_api.APIKEY,
  APISECRET: config.binance_api.APISECRET,
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: false // If you want to use sandbox mode where orders are simulated
});

var markets = {}
var MarketName
var buyPrice = 0

exports.init = function() {
  binancebot.bookTickers((error, tickers) => {
    for (var i in tickers) {
      markets[tickers[i].symbol] = tickers[i]
    }
  });
}


exports.subscribe = function(res) {
  binancebot.bookTickers(MarketName, (error, ticker) => {
    var ask = ticker.askPrice;
    res.json({
      "price": ask,
      "dev": Math.trunc((ask / buyPrice) * 10000) / 10000
    })
  });
}

exports.buy = function(data, res) {
  try {
    MarketName = data.coin.toUpperCase() + "BTC"
    var amountToBuy = Math.trunc((Number(data.btc_amount) / Number(markets[MarketName].askPrice)) * 1000) / 1000;
  } catch (e) {
    throw e;
  }

  if (data.test == "1") {
    binancebot.bookTickers(MarketName, (error, ticker) => {
      buyPrice = ticker.askPrice.toString();
      res.json({
        "price": buyPrice,
        "qty": amountToBuy
      })
    });
  } else {
    binancebot.buy(MarketName, amountToBuy, 0, {
      type: "MARKET",
      newOrderRespType: "FULL"
    }, function(err, dat) {
      console.log(dat);
      if (err) {
        return console.error(err);
      }
      if (dat.status == "FILLED") {
        buyPrice = dat.fills[0].price
        res.json({
          "price": dat.fills[0].price,
          "qty": amountToBuy
        })
      } else {
        res.json({
          "error": "unsucsessfull buy"
        })
      }
    });
  }

  exports.sell = function(data, res) {
    MarketName = data.coin.toUpperCase() + "BTC"
    binancebot.sell(MarketName, amountToBuy, 0, {
      type: "MARKET",
      newOrderRespType: "FULL"
    }, function(err, dat) {
      console.log(dat);
      if (err) {
        return console.error(err);
      }
      if (dat.status == "FILLED") {
        res.json({
          "price": dat.fills[0].price,
          "qty": amountToBuy
        })
      } else {
        res.json({
          "error": "unsucsessfull buy"
        })
      }
    });
  }


}