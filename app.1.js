var express = require('express');
var app = express();
var pdfjsLib = require('pdfjs-dist');
var fs = require('fs');
var async = require('async');


var operator = require('./core/Operator_class');

const winston = require('winston');

var pager = 0;



var formatted = {}; // Eind formaat



var lastPromise; // will be used to chain promises
var Content_array = Array();
     var data_array = new Array();
     
// var pdfPath = process.argv[2] || './pdf/Double-page.pdf';
// var pdfPath = process.argv[2] || './pdf/angled_2.pdf';
// var pdfPath = process.argv[2] || './pdf/angled_3.pdf';
var pdfPath = process.argv[2] || './pdf/flyer_wijk.pdf';
// var pdfPath = process.argv[2] || './pdf/Arnhem.pdf';


// var pdfPath = process.argv[2] || './pdf/Singlepage-singleImage.pdf';

var pageinfo = '';
var numPages = 0;
var data_set = 'false';
app.get('/', function(req, res) {

  var load = 'false';

  // Will be using promises to load document, pages and misc data instead of
  // callback.
  pdfjsLib.disableFontFace = true; // should resolve document not defined error
  
  pdfjsLib.getDocument(pdfPath).then(function(doc) {








    numPages = doc.numPages;
    console.log(numPages);

    
    lastPromise = doc.getMetadata();
    var loadPage = function(pageNum) {


      // doc.getAttachments().then(function(att) {
      //   console.log(att);

      // });
      // return


      return doc.getPage(pageNum).then(function(page) {
        var page_data = {};
        var viewport = page.getViewport(1.0 /* scale */ ); //increase to 2 to increase quality >>>
        var font_data = Array();


        page.getTextContent().then(function(content) {
// console.log(content);
          // Setting Page info
          operator.pageInfo(pageNum, viewport, function(map) {
            pageinfo = map;

          });


          switch (req.query.filter) {

            case 'text':
              //loops through 4 times, once for each page
       
              // Content contains lots of information about the text layout and
              // styles, but we need only strings at the moment

              //Test data gather
              Content_array.items = new Array();
              operator.getText(page, pageinfo, content, numPages, data_array, function(map) {
        

        
        
        
                Content_array.push(map);


                for (i = 0; i < map.length; i++) {

                  if (typeof map[i].fontName !== 'undefined') {

                    font_data.push(map[i].fontName); //gathers the generated font names


                  }
                }
                var newArray = [...new Set(font_data)]; //Making unique



                for (i = 0; i < newArray.length; i++) {

                  content.styles[newArray[i]].fontName = newArray[i];
                  Content_array.push(content.styles[newArray[i]]);

                }

                load = 'true'; // allowence to proceed
              });
              console.log('data_array pushed');
     fs.writeFileSync("./logs/data_array.js", JSON.stringify(data_array, null, 4)); //no idea what
 
              // console.log(data_array);
              break;
            case 'image':
              //Image function pasting
              operator.getImage(page, pdfjsLib, pageinfo, function(map) {

                Content_array.push(map);
                //             console.log('()__())(_+_+--==-=-__+-=-=-=-_-_+=-=_+_+-=-=_+-==-==-__+');
                // console.log(Content_array);
                load = 'true'; // allowence to proceed
              });

              break;
            case 'path':
              //Path function pasting
              operator.getPath(page, pdfjsLib, doc, pageinfo, function(map) {
                Content_array.push(map);
                load = 'true'; // allowence to proceed
              });

              break;
            case 'meta':

              operator.getMeta(doc, function(map) {
                Content_array.push(map);
                load = 'true'; // allowence to proceed
              });



              break;
            default:
              //------------Insert Text and font -------------//

              // Content contains lots of information about the text layout and
              // styles, but we need only strings at the moment

              //Test data gather
              Content_array.items = new Array();
              operator.getText(page, pageinfo, content, numPages, data_array, function(map) {

                Content_array.push(map);
                // console.log(map);

                for (i = 0; i < map.length; i++) {

                  if (typeof map[i].fontName !== 'undefined') {

                    font_data.push(map[i].fontName); //gathers the generated font names


                  }
                }
                var newArray = [...new Set(font_data)]; //Making unique


                // Content_array.font = new Array();


                for (i = 0; i < newArray.length; i++) {

                  // Content_array.font[newArray[i]] = new Array();
                  content.styles[newArray[i]].fontName = newArray[i];
                  Content_array.push(content.styles[newArray[i]]);

                }

                // load = 'false'; // allowence to proceed
              });


              //------------Insert image -------------//

              //Image function pasting
              operator.getImage(page, pdfjsLib, pageinfo, function(map) {

                Content_array.push(map);
                // load = 'false'; // allowence to proceed
              });


              //------------End -------------//
              //------------Insert path -------------//



              //Path function pasting
              operator.getPath(page, pdfjsLib, doc, pageinfo, function(map) {
                Content_array.push(map);
                load = 'true'; // allowence to proceed
              });

              //------------End -------------//
              break;

          }


          // console.log('----=----TOP--==-------');
          //           console.log(Content_array);
          //         console.log('----=----END--==-------');
          //     console.log('--==-==--=---=-=-=--=-=-=--=-=----=-=-=_+_+--==-=-__+-=-=-=-_-_+=-=_+_+-=-=_+-==-==-__+');
          // console.log(Content_array);
          Content_array.pages = Array();
          Content_array.items = Array();
          Content_array.styles = Array();



          for (i = 0; i < content.styles.length; i++) {

            Content_array.push(content.styles);
          }

        }).then(function() {
          // console.log();
        }); //End getTextContent

        // console.log(Content_array);


      })

    };


    // Loading of the first page will wait on metadata and subsequent loadings
    // will wait on the previous pages.
    for (var i = 1; i <= numPages; i++) {
      lastPromise = lastPromise.then(loadPage.bind(null, i));
    }
    return lastPromise;


  }).then(function() {
    console.log('# End of Document');

    //// Remove any duplicates whatsoever
    // var Content_array = [...new Set(Content_array)]; //Making unique


    var _flagCheck = setInterval(function() { //Checking whether load is set to true
      if (load == 'true') {
        clearInterval(_flagCheck);
        try {
          // fs.writeFileSync("./logs/array.js", JSON.stringify(Content_array, null, 4)); 

          if (typeof Content_array[0][0].width === 'undefined') {
            var Special_array = Content_array[0];
          }
          else {
            var Special_array = Content_array[0][0];
          }
        }
        catch (x) {
          var Special_array = Content_array[0];
        }
       
        try {
          formatted.width = Special_array.width; // 0 = page 0 -> Todo change 0 to loop for each page || Solved by removing the [0]
          formatted.height = Special_array.height;
        }
        catch (x) {
          formatted.width = Special_array.image_scale_width; // 0 = page 0 -> Todo change 0 to loop for each page || Solved by removing the [0]
          formatted.height = Special_array.image_scale_height;
        }
        formatted.pages = new Array();
        var temp_formatted = {};




        var content = new Array(); //@todo: regelen dat de [0] uit content array removed wordt.

        for (var u = 0; u < Content_array.length; u++) { // 26 loop

          // if (typeof lastname === "undefined") { // filter undefined out [error preventing] // maybe killing it 
          //   Content_array[u] = 0;

          // }

          if (typeof Content_array[u].length === 'undefined') {
            content.push(Content_array);
          }
          // Math.round(Math.asin(data.transform[1]) * (180/Math.PI))

          // content.push(Content_array[u]);
          // console.log("26 loop :      " + Content_array.length);
          // console.log("18 loop :      " + Content_array[u].length);
          // console.log();
          for (var z = 0; z < Content_array[u].length; z++) { // 18 loop
            // console.log(" # " + z + "   :      " + Content_array[u][z].length);


            if (typeof Content_array[u][z].length !== 'undefined') {


              content.push(Content_array[u]);
              z = Content_array[u].length;
            }
            else {

              content.push(Content_array[u][z]);

            }
          }

        }



        for (var x = 1; x <= numPages; x++) {



          var y = '';
          // console.log('pagenumber = x =   #' + x);

          // console.log(Content_array[x]);
          // console.log('Content: ');
          // console.log(content);

          temp_formatted.number = x;
          temp_formatted.elements = {};
          var name = 0;
          var i = 0;
          for (i = 0; i < content.length; i++) {


            var data = content[i];
            // console.log('Content Page : ' + data.page + '     ||     Loop Nr.  ' + i);




            try {

              // console.log(data)
              // console.log('elementnumber = i =   #' + i);
              //   // console.log('element_page = ' + Content_array[0][i].page);
              // console.log(data)
              // console.log(Content_array[0][i]);
              // console.log(i);



              if (data.page == x) {
                // console.log('elementnumber = i =   #' + i);
                // console.log(data)



                if (data.page_num == null) {
                  temp_formatted.elements.name = 'Object' + name++;
                  // console.log(Content_array[0][i]);

                  temp_formatted.elements.type;



                }


                if (data.str != null) { // If text
                  temp_formatted.elements.type = 'text';
                  temp_formatted.elements.width = data.width;
                  temp_formatted.elements.height = data.height;
                  temp_formatted.elements.x = data.transform[4];
                  temp_formatted.elements.y = data.transform[5];
                  temp_formatted.elements.a = Math.floor((Math.round(data.transform[1]) * (180 / Math.PI) / 10).toFixed(0)); //Rotation variable (still to be calculated how many degrees it's turned)
                  temp_formatted.elements.z = name; //z-index (++ variable)
                  temp_formatted.elements.settings = {};
                  temp_formatted.elements.settings.text = data.str;
                  temp_formatted.elements.settings.fontFamily = data.fontName;
                   temp_formatted.elements.settings.color = data.colour;
                  // console.log('text :    ' + data.str);
                  // console.log('graden : ' + Math.round(data.transform[1]) * (180/Math.PI) / 10 + '°');




                  // formatted.pages.push(JSON.stringify(temp_formatted));
                  // formatted.pages.push(JSON.stringify(temp_formatted).replace('\\', ''));
                  formatted.pages.push(JSON.parse(JSON.stringify(temp_formatted)));




                  // console.log();
                  // console.log(temp_formatted);
                  // console.log(Content_array[0][i]);
                  // console.log(JSON.stringify(temp_formatted, null, 4));
                  // console.log();
                }
                else if (data.image_name != null) { // If image




                  temp_formatted.elements.type = 'image';

                  temp_formatted.elements.width = data.image_scale_width;
                  temp_formatted.elements.height = data.image_scale_height;
                  temp_formatted.elements.x = data.image_x;
                  temp_formatted.elements.y = data.image_y;
                  // temp_formatted.elements.a = (Math.round(data.transform[1]) * (180/Math.PI) / 10).toFixed(0) - 1; //Rotation variable (still to be calculated how many degrees it's turned)
                  temp_formatted.elements.z = name; //z-index (++ variable)
                  temp_formatted.elements.settings = {};




                  console.log('Initiate IMAGE' + data.image_name);

                  // temp_formatted.elements.settings.src = data.src; //SRC voor base 64
                  temp_formatted.elements.settings.src = 'BASE64_Image_' + data.image_name; //SRC voor base 64



                  formatted.pages.push(JSON.parse(JSON.stringify(temp_formatted)));



                }
                else if (data[0] == 'M') { // If path
                  temp_formatted.elements.type = 'path';
                  temp_formatted.elements.x = data[1];
                  temp_formatted.elements.y = data[2];
                  temp_formatted.elements.a; //Rotation variable (still to be calculated how many degrees it's turned)
                  temp_formatted.elements.z = name; //z-index (++ variable)
                  temp_formatted.elements.settings = {};
                  var new_path = new Array(); //new
                  var temp_string = '';

                  for (var o = 0; o < data.length; o++) {


                    if (isNaN(data[o])) {
                      //if text
                      if (temp_string.substr(temp_string.length - 1) == ',') {
                        temp_string = temp_string.slice(0, -1);
                      }
                      temp_string = temp_string + data[o];



                      // new_path.push(data[o]);
                    }
                    else {

                      if (isNaN(temp_string.substr(temp_string.length - 1))) { //? 
                        // console.log('temp str last character :     ' + temp_string.substr(temp_string.length - 1));
                        // console.log('data:     ' + data[o]);
                        //letter
                        temp_string = temp_string + data[o];

                        temp_string = temp_string + ',';
                      }
                      else {

                        // temp_string = '';
                        //number
                      }


                    }
                  } //foreach DATA (path)

                  new_path.push(temp_string);


                  temp_formatted.elements.settings.path = new_path;

                  if (y == temp_string) { //Preventing duplicate Object names from occuring
                    console.log('Duplicate Found!');
                    name--;

                  }
                  else {
                    y = temp_string;
                    formatted.pages.push(JSON.parse(JSON.stringify(temp_formatted)));
                  }
                  console.log('y :                          ' + y);
                  console.log('Temp_string :                ' + temp_string);

                  console.log(y == temp_string);
                  // console.log();

                } //END if


                temp_formatted.elements = {};
              } // END page = x loop

            } // Element try loop
            catch (err) {} // END IF PAGE = correct PAGE loop




          } // FORCED IF TO CHECK WHETHER PAGE EVEN EXCISTS
          // console.log();

        } // END pages loop


        res.send(formatted);
      }
    }, 1000); // interval set at 1000 milliseconds


    // res.send({ content: Content_array });
    Content_array = Array();
  }, function(err) {
    console.error('Error: ' + err);
  });

});




app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});

module.exports = app
