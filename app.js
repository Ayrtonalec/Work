var express = require('express');
var app = express();
var pdfjsLib = require('pdfjs-dist');
var fs = require('fs');
var Parser = require('./core/parser');

app.get('/', function(req, res) {
  var rawData = new Uint8Array(fs.readFileSync('./helloworld.pdf'));
  
  pdfjsLib.getDocument(rawData).then(function(pdfDocument) {
    pdfDocument.getPage(1).then(function(page) {
      return page.getOperatorList().then(function (opList) {
        var parser = new Parser(page.commonObjs, page.objs);
        parser.parse(opList).then(function(elements) {
          res.send({elements: elements});
        });
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