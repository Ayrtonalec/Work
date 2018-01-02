var express = require('express');
var app = express();
var pdfjsLib = require('pdfjs-dist');
var fs = require('fs');

app.get('/', function(req, res) {
  var rawData = new Uint8Array(fs.readFileSync('./helloworld.pdf'));
  
  pdfjsLib.getDocument(rawData).then(function(pdfDocument) {
    pdfDocument.getPage(1).then(function(page) {
      return page.getOperatorList().then(function (opList) {
        res.send({opList: opList});
      });
    });
  }).catch(function(reason) {
    res.send({err: reason});
  });
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

module.exports = app