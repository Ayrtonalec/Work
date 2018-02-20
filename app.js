var express = require('express');
var app = express();
var pdfjsLib = require('pdfjs-dist');
var fs = require('fs');
// var Parser = require('./node_modules/pdfjs-dist/lib/display/svg');
var Parser = require('./core/parser');
var Image = require('./core/domstubs');
// var canvas = require('canvas');
// var Image = canvas.Image;


//Experimental B
// var jpg = require('./node_modules/pdfjs-dist/lib/core/jpg.js');
// var image_src = require('./node_modules/pdfjs-dist/lib/core/image.js');
// var jpeg = require('./node_modules/pdfjs-dist/lib/core/jpeg_stream.js');
//Experimental E


//Advanced Error handling
// const pino = require('pino')()
 

// pino.error(new Error('an error'))


//Function to gather GET variable From the URL
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}





// var FileName = './' + 'helloworld' + '.pdf'; // Basic test file
// var FileName = './' + 'Singlepage-Image' + '.pdf'; //Containing image
var FileName = './' + 'Double-page' + '.pdf'; //Containing two pages
// var FileName = './' + 'Test-pdf' + '.pdf'; //Containing two pages



app.get('/', function(req, res) {


  var rawData = new Uint8Array(fs.readFileSync(FileName)); //Resulting in over 13.000 different numbers


  pdfjsLib.getDocument(rawData).then(function(pdfDocument) { //General data pointing to display/api.js

 
    var all_elements = ""; // Stacking results
    var i = 1; // Loop variable
    var previous = 0; // used for multiple pages
    var current_page = 1; // Page counter
    var tot_pages = pdfDocument.pdfInfo.numPages + 1;
    while (i <= pdfDocument.pdfInfo.numPages) {

      pdfDocument.getPage(i).then(function(page) {
       


        return page.getOperatorList().then(function(opList) {
        //This function gathers data


          // console.log(opList);

          var parser = new Parser(page.commonObjs, page.objs); // results empty variable where elements are in
            
              // Debug: _____
              //commonobjs: -> page.commonObjs.objs.g_d0_f2
                          //   { capability: 
                          // { resolve: [Function: s],
                          //   reject: [Function: t],
                          //   promise: Promise { <pending> } },
                          // data: null,
                          // resolved: false }


    
            // console.log(page.objs); ->contains two empty objects (arrays)
                        //{ objs: {} }
            // _____

// console.log(opList);
//Data already gathered by this point -> Incorrect? -> second thoughts?
          //Pointing towards parser.js
          parser.parse(opList).then(function(elements) { //Processing data

    


            if (previous == 0) { //Used for multiple page PDF's

              previous = current_page; //Filling previous var
              all_elements = elements; //copying elements to new var

              //Defining pages
              var temp_i = 0; //Defining Temp Variable


              while (temp_i < elements.length) { //looping through for every element

                all_elements[temp_i].page = tot_pages - current_page;
                temp_i = temp_i + 1;
              }

            }
            else { // If multiple page


              //Defining pages
              var temp_i = 0; //Defining Temp Variable

              while (temp_i < elements.length) { //looping through for every element
                // console.log(temp_i);
                elements[temp_i].page = tot_pages - current_page;
                temp_i = temp_i + 1;
              }
      

              all_elements = all_elements.concat(elements); //Combine variable with elements


            } // end previous
          

            current_page = current_page + 1;

            if (current_page == tot_pages) {

              res.send({ elements: all_elements });
            }


          });
        }); // end oplist


      }); //end PDF Document getpage

      i = i + 1;
    }


  }).catch(function(reason) {
    
    res.send({ err: reason },{ error: " reported by catch function app.js "});
  });
});





app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});

module.exports = app
