const http = require("http")
const fs = require("fs")
const url = require('url')
const qs = require('querystring');
const bittrex = require('./bittrex')

var server = http.createServer(function(req, res) {
  var q = url.parse(req.url, true).query;
  if (req.method == "POST") {

    var jsonString = '';

    req.on('data', function(data) {
      jsonString += data;
    });

    req.on('end', function() {
      var r = qs.parse(jsonString)
      bittrex.buy(r, res)
    });

  } else if (req.method == "GET") {
    if (req.url == "/subscribe") {
      bittrex.subscribe(res)
    } else {
      fs.readFile('index.html', function(err, data) {
        if (err) {
          throw err;
        }
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.write(data);
        res.end();
      });
    }
  }
}).listen(3000);

bittrex.init()