var express = require('express');
var app = express();
var pdfjsLib = require('pdfjs-dist');
var fs = require('fs');
var async = require('async');


var operator = require('./core/Operator_class');
var storage = require('./core/Storage_class');


const winston = require('winston');

var pager = 0;



var formatted = {}; // Eind formaat



var lastPromise; // will be used to chain promises
var Content_array = Array();
var data_array = new Array();

// var pdfPath = process.argv[2] || './pdf/Double-page.pdf';
// var pdfPath = process.argv[2] || './pdf/angled_2.pdf';
var pdfPath = process.argv[2] || './pdf/angled_3.pdf';
// var pdfPath = process.argv[2] || './pdf/flyer_wijk.pdf';
// var pdfPath = process.argv[2] || './pdf/Arnhem.pdf';


// var pdfPath = process.argv[2] || './pdf/Singlepage-singleImage.pdf';

var pageinfo = '';
var numPages = 0;
var data_set = 'false';
app.get('/', function(req, res) {

  var load = 'false';


  // Will be using promises to load document, pages and misc data instead of
  // callback.
  // pdfjsLib.disableFontFace = true; // should resolve document not defined error

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


            // I accept your feelings which is why I'll keep silent for 

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

            fs.writeFileSync("./logs/content.js", JSON.stringify(content, null, 4)); //no idea what

            for (var x = 1; x <= numPages; x++) {



              var y = '';


              temp_formatted.number = x;
              temp_formatted.elements = {};

              var alinea = new Array(); // Alinea calculations
              alinea.oldposy;
              alinea.oldposx;
              alinea.str;
              alinea.width = 0;
              alinea.height = 0;
              alinea.max_allowance = 20; //set max allowance
              alinea.lines = 1;
              alinea.totalY;
              alinea.backupY;
              alinea.fontName;
              alinea.colour; //set alinea colour
              var data_next;
              var name = 0;
              var i = 0;
              for (i = 0; i < content.length; i++) {


                var data = content[i];
                if (typeof content[i + 1] !== undefined) {
                  data_next = content[i + 1];
                }
                else {
                  data_next = 'last';
                }


                try {

                  if (data.page == x) {

                    if (data.page_num == null) {
                      temp_formatted.elements.name = 'Object' + name++;

                      temp_formatted.elements.type;


                    }


                    if (data.str != null) { // If text

                      var lastcheck = false;

                      //setters incase first loop:
                      if (typeof alinea.backupY === 'undefined' || alinea.pushed_alinea == true) {
                        alinea.pushed_alinea = false;
                        alinea.backupY = data.transform[5];
                        alinea.oldposx = data.transform[4];
                      }




                      if ((alinea.backupY - data.transform[5]) < alinea.max_allowance && (alinea.backupY - data.transform[5]) >= 0 && ((data.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines)) < 2 || (alinea.backupY - data_next.transform[5]) == 0)) {
                        if (typeof alinea.fontName === undefined) {
                          alinea.fontName = data.fontName;
                        }

                        alinea.totalY = alinea.totalY + (data.transform[5] - alinea.backupY); // TODO: use this to push Y cords
                        alinea.lines++; // counter used in the IF to calculate distance of next line (20 * line)



                        //calculate alinea height
                        alinea.height = alinea.height + data.height;

                        //get the longest line to set alinea width
                        if (alinea.width < data.width) {
                          alinea.width = data.width;
                        }




                        //TODO implement here Colour/font/angle
                        if (typeof alinea.str === 'undefined' || alinea.str == '') { // first record

                          alinea.str = data.str; // In case of first line of alinea, No \n
                          //set alinea colour
                          if (typeof data.colour !== 'undefined') {
                            alinea.colour = data.colour;
                          }
                          else {
                            alinea.colour = '';
                          } //end colour

                        } //end if first
                        else {
                          if (data.colour != alinea.colour) {
                            data.str = "<span style='color: " + data.colour + "'>" + data.str;
                          }
                          else {
                            data.str = data.str + '</span>';
                          }
                          //if colour is different from main colour
                          // alinea += <span style='color: [hex here]'
                          // if colour is different </span>
                          alinea.str = alinea.str + " \n " + data.str; // n = enter for new line support

                        }






                        if (typeof alinea.oldposy === undefined && alinea.oldposy == 0) {
                          alinea.oldposy = data.transform[5];
                        }

                      }


                      else {

                      }
                      alinea.backupY = data.transform[5];


                      //If difference of next one is still part of this alinea then procceed
                      if ((alinea.backupY - data_next.transform[5]) < alinea.max_allowance && (alinea.backupY - data_next.transform[5]) >= 0 && ((data_next.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines)) < 2) || (alinea.backupY - data_next.transform[5]) == 0) {
                        console.log('----');
                        console.log('| distance is: ' + (alinea.backupY - data_next.transform[5]) + '...');
                        console.log('| string: ' + alinea.str);

                        console.log('| next one is part of this alinea still...');

                      }
                      else {

                        console.log('----');
                        console.log('| Parameter 1: Y(<20) ' + ((alinea.backupY - data_next.transform[5]) < alinea.max_allowance) + '   |   ' + ((alinea.backupY - data_next.transform[5]))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                        console.log('| Parameter 2: Y(0>)  ' + ((alinea.backupY - data_next.transform[5]) >= 0) + '   |   ' + ((alinea.backupY - data_next.transform[5]))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                        console.log('| Parameter 3: X(<2)  ' + (data_next.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines) < 2) + '   |   ' + (data_next.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                        console.log('| distance is: ' + (alinea.backupY - data_next.transform[5]) + '...');
                        console.log('| Alinea_string: ' + alinea.str);
                        console.log('| next_string: ' + data_next.str);

                        // if (typeof alinea.str === 'undefined') {
                        console.log('| data_string: ' + data.str); //That was because I don't know whether they can reschedule it but you're more important to me so if I have to choose between you and a presentation I'm choosing you
                        // }
                        console.log('| pushing this alinea ...');

                        temp_formatted.elements.type = 'text_alinea';
                        temp_formatted.elements.width = alinea.width;
                        temp_formatted.elements.height = alinea.height;
                        temp_formatted.elements.x = alinea.oldposx;
                        temp_formatted.elements.y = alinea.backupY;
                        temp_formatted.elements.a = Math.floor((Math.round(data.transform[1]) * (180 / Math.PI) / 10).toFixed(0)); //Rotation variable (still to be calculated how many degrees it's turned)
                        temp_formatted.elements.z = name; //z-index (++ variable)
                        temp_formatted.elements.settings = {};
                        temp_formatted.elements.settings.text = alinea.str;
                        temp_formatted.elements.settings.fontFamily = data.fontName; //picks only the last font
                        temp_formatted.elements.settings.color = data.colour; //picks only the last colour


                        formatted.pages.push(JSON.parse(JSON.stringify(temp_formatted)));


                        alinea.oldposy = 0;
                        alinea.oldposx = 0;
                        alinea.str = '';
                        alinea.width = 0;
                        alinea.height = 0;
                        alinea.fontName = '';
                        alinea.lines = 1;
                        alinea.totalY = 0;
                        alinea.backupY = 0;
                        alinea.pushed_alinea = true;
                        alinea.colour = ''; //set alinea colour
                        alinea.oldposx = data.transform[4];
                        alinea.oldposy = data.transform[5];

                      }



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
                      var src_data = storage.get_src();
                      for (var e = 0; e < src_data.length; e++) {
                        if (src_data[e].id == data.image_name) {
                          if (typeof src_data[e].src.kind === 'undefined') {
                            // temp_formatted.elements.settings.src = src_data[e].src;
                            temp_formatted.elements.settings.src = src_data[e].src;
                          }
                        }
                      }



                      console.log('Initiate IMAGE' + data.image_name);

                      // temp_formatted.elements.settings.src = data.src; //SRC voor base 64
                      // temp_formatted.elements.settings.src = 'BASE64_Image_' + data.image_name; //SRC voor base 64



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




              } // FORCED IF TO CHECK WHETHER PAGE EVEN EXISTS
              // console.log();

            } // END pages loop


            res.send(formatted);
          }
        },
        1000); // interval set at 1000 milliseconds


      // res.send({ content: Content_array });
      Content_array = Array();
    },
    function(err) {
      console.error('Error: ' + err);
    });

});




app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});

module.exports = app
