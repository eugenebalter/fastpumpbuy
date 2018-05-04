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
    //    console.log(res)
  });
}


exports.subscribe = function(res) {
  binancebot.bookTickers(MarketName, (error, ticker) => {
    var ask = ticker.askPrice;
    res.end(JSON.stringify({
      "price": ask,
      "dev": Math.trunc((ask / buyPrice) * 10000) / 10000
    }))
  });
}

exports.buy = function(data, res) {
  try {
    MarketName = data.coin.toUpperCase() + "BTC"
    var amountToBuy = Math.trunc((Number(data.btc_amount) / Number(markets[MarketName].askPrice)) * 1000) / 1000;

  } catch (e) {
    // ���������� ��� ������ � ��������
    throw e;
  }

  if (data.test == "1") {
    binancebot.bookTickers(MarketName, (error, ticker) => {
      buyPrice = ticker.askPrice.toString();
      res.end(JSON.stringify({
        "price": buyPrice,
        "qty": amountToBuy
      }))
    });
  } else {
    var dat = {
      market: MarketName,
      quantity: amountToBuy,
      rate: Number(markets[MarketName].Last) * 2
    };
    binancebot.buy(MarketName, amountToBuy, 0, "MARKET", function(err, dat) {
      console.log(dat);
      if (err) {
        return console.error(err);
      }
      if (dat.status == "FILLED") {
        res.end(JSON.stringify({
          "price": dat.fills[0].price,
          "qty": amountToBuy
        }))
      } else {
        res.end(JSON.stringify({
          "error": "unsucsessfull buy"
        }))
      }
    });
  }




}