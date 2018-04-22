const binancebot = require('node-binance-api');
const config = require('./config');

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
  bittrex.getmarketsummaries(function(res) {
    for (var i in res.result) {
      markets[res.result[i].MarketName] = res.result[i]
    }
    //    console.log(res)
  });
}


exports.subscribe = function(res) {
  bittrex.getticker({
    market: MarketName
  }, function(tick) {
    //      console.log(ticker)
    if (tick) {
      var ask = tick.result.Bid.toString();
      console.log(ask)
      res.end(JSON.stringify({
        "price": ask,
        "dev": Math.trunc((buyPrice / ask) * 100) / 100
      }))
    } else {
      res.end(JSON.stringify({
        "price": 0
      }))
    }
  })
}

exports.buy = function(data, res) {
  console.log(data);
  MarketName = "BTC-" + data.coin.toUpperCase()

  var amountToBuy = Math.trunc((Number(data.btc_amount) / Number(markets[MarketName].Last)) * 1000) / 1000;

  if (data.test == "1") {
    bittrex.getticker({
      market: dat.market
    }, function(ticker) {
      //      console.log(ticker)
      buyPrice = ticker.result.Ask.toString();
      res.end(JSON.stringify({
        "price": buyPrice,
        "qty": amountToBuy
      }))
    })
  } else {
    var dat = {
      market: MarketName,
      quantity: amountToBuy,
      rate: Number(markets[MarketName].Last) * 2
    };
    //  bittrex.buylimit(dat, function(err, dat) {
    //    console.log(dat);
    //    if (err) {
    //      return console.error(err);
    //    }
    //    if (dat.success == true) {}
    //  });
    res.end("done");
  }




}