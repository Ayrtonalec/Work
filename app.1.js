var express = require('express');
var app = express();
var pdfjsLib = require('pdfjs-dist');
var fs = require('fs');
var async = require('async');


var operator = require('./core/Operator_class');
var storage = require('./core/Storage_class');

//File Upload    ---------------------------------------



// var bodyParser = require('body-parser');
// /** bodyParser.urlencoded(options)
// * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
// * and exposes the resulting object (containing the keys and values) on req.body
// */
// //Include the package
// var multer = require('multer');

// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads')
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// });
// var upload = multer({ storage: storage });


//File Upload end ---------------------------------------






var formatted = {}; // Eind formaat



var lastPromise; // will be used to chain promises
var Content_array = Array();
var data_array = new Array();

// var pdfPath = process.argv[2] || './pdf/Double-page.pdf';
// var pdfPath = process.argv[2] || './pdf/spacing.pdf';              //werkt
var pdfPath = process.argv[2] || './pdf/angled_3.pdf'; //werkt
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


      return doc.getPage(pageNum).then(async function(page) {
        var page_data = {};
        var viewport = page.getViewport(1.0 /* scale */ ); //increase to 2 to increase quality >>>
        var font_data = Array();


        await page.getTextContent().then(function(content) {

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
                console.log('set load = true');

                load = 'true'; // allowence to proceed
              });
              console.log('data_array pushed');
              fs.writeFileSync("./logs/data_array.js", JSON.stringify(data_array, null, 4)); //no idea what

              break;
            case 'image':
              //Image function pasting
              operator.getImage(page, pdfjsLib, pageinfo, function(map) {

                Content_array.push(map);

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


            var content = new Array();

            for (var u = 0; u < Content_array.length; u++) { // 26 loop


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
              alinea.max_allowance = 25; //set max allowance
              alinea.lines = 1;
              alinea.totalY;
              alinea.backupY;
              alinea.fontName;
              alinea.colour; //set alinea colour
              alinea.diff_colour = false;
              alinea.pushed = false;
              alinea.rotation;
              alinea.prev_colour;
              alinea.fontSize;
              alinea.extra_colour = new Array();

              var data_next;
              var name = 0;
              var i = 0;

              for (i = 0; i < content.length; i++) {


                var data = content[i];




                try {

                  if (data.page == x) {

                    if (data.page_num == null) {
                      temp_formatted.elements.name = 'Object' + name++;

                      temp_formatted.elements.type;


                    }


                    if (data.str != null) { // If text
                      if (typeof content[i + 1].str !== 'undefined') {
                        data_next = content[i + 1];
                        // console.log(data_next);
                      }
                      else {
                        console.log("Last initiated");
                        data_next = 'last';


                        temp_formatted.elements.type = 'text_alinea';
                        temp_formatted.elements.width = alinea.width;
                        temp_formatted.elements.height = alinea.height;
                        temp_formatted.elements.x = alinea.oldposx;
                        temp_formatted.elements.y = alinea.backupY;
                        temp_formatted.elements.a = alinea.rotation; //Rotation variable (still to be calculated how many degrees it's turned)
                        temp_formatted.elements.z = name; //z-index (++ variable)
                        temp_formatted.elements.settings = {};
                        temp_formatted.elements.settings.text = alinea.str;
                        temp_formatted.elements.settings.fontFamily = data.fontName; //picks only the last font
                        temp_formatted.elements.settings.color = alinea.colour; //picks only the last colour
                        temp_formatted.elements.settings.spacing = data.spacing; //picks only the last space
                        temp_formatted.elements.settings.fontSize = alinea.fontSize;

                        formatted.pages.push(JSON.parse(JSON.stringify(temp_formatted)));

                        // console.log("============================== === === === === === === === === === === === === === === === === === === === ");
                        // console.log('temp_formatted :   ' + temp_formatted.elements.settings.text);
                        // console.log('data     :   ' + JSON.stringify(data));
                        // console.log("=======================================================================================");

                      }
                      var extra_colour = {};
                      // console.log(data);

                      //setters incase first loop:
                      if (typeof alinea.backupY === 'undefined' || alinea.pushed_alinea == true) {
                        alinea.pushed_alinea = false;
                        alinea.backupY = data.transform[5];
                        alinea.oldposx = data.transform[4];
                      }

                      // console.log('----');
                      // console.log('| Parameter 1: Y(<20) ' + ((alinea.backupY - data.transform[5]) < alinea.max_allowance) + '   |   ' + (alinea.backupY - data.transform[5]) + '   |  BackupY:  ' + alinea.backupY + '   |  data_next:  ' + alinea.backupY); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                      // console.log('| Parameter 2: Y(0>)  ' + ((alinea.backupY - data.transform[5]) >= 0) + '   |   ' + ((alinea.backupY - data.transform[5]))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                      // console.log('| Parameter 3: X(<2)  ' + (data.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines) < 2) + '   |   ' + (data.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it

                      // console.log('1  | data_string: ' + data.str);
                      if ((alinea.backupY - data.transform[5]) < alinea.max_allowance && (alinea.backupY - data.transform[5]) >= 0 && ((data.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines)) < alinea.width || (alinea.backupY - data_next.transform[5]) == 0)) {
                        if (typeof alinea.fontName === 'undefined') {
                          alinea.fontName = data.fontName;
                        }
                        if (req.query.mode == 'debug') {
                          // console.log('2  | data_string: ' + data.str + '               |  ' + (alinea.backupY - data.transform[5]));

                        }
                        alinea.totalY = alinea.totalY + (data.transform[5] - alinea.backupY); // TODO: use this to push Y cords
                        alinea.lines++; // counter used in the IF to calculate distance of next line (20 * line)

                        alinea.fontSize = data.transform[0];

                        //calculate alinea height
                        alinea.height = alinea.height + data.height;

                        //get the longest line to set alinea width
                        if (alinea.width < data.width) {
                          alinea.width = data.width;
                        }

                        //TODO implement here Colour/font/angle
                        if (typeof alinea.str === 'undefined' || alinea.str == '') { // first record


                          alinea.str = data.str; // In case of first line of alinea, No \n
                          alinea.rotation = Math.floor((Math.round(data.transform[1]) * (180 / Math.PI) / 10).toFixed(0));


                          //set alinea colour
                          if (typeof data.colour !== 'undefined') {
                            alinea.colour = data.colour;

                          }
                          else {
                            alinea.colour = '';
                          } //end colour

                        } //end if first
                        else {
                          if (typeof data.colour === "undefined") {
                            data.colour = '';
                          }
                          else {


                            if (data.colour != alinea.colour) {

                              if (alinea.prev_colour == data.colour) {
                                console.log('init first');
                                if (alinea.diff_colour == false) { //First different colour
                                  alinea.diff_colour = true;




                                  extra_colour.begin_pos = alinea.str.length;
                                  extra_colour.end_pos = (alinea.str.length + data.str.length);

                                  // temp_formatted.elements.settings.color_extra.push(extra_colour);

                                  // data.str = "<span style='color: " + data.colour + "'>" + data.str;
                                  alinea.prev_colour = data.colour;
                                  alinea.extra_colour.push(extra_colour);

                                }
                              }
                              else { // followup different colours





                                extra_colour.color = data.colour;
                                extra_colour.begin_pos = alinea.str.length;

                                extra_colour.end_pos = (alinea.str.length + data.str.length);

                                alinea.extra_colour.push(extra_colour);



                                // data.str = data.str + '</span > ';
                                // data.str = "<span style='color: " + data.colour + "'>" + data.str;
                              }






                            }
                            else { // if laste
                              alinea.diff_colour = false;
                              // data.str = data.str + '</span>';
                            }
                          }
                          //if colour is different from main colour
                          // alinea += <span style='color: [hex here]'
                          // if colour is different </span>
                          if (alinea.backupY - data.transform[5] == 0) {

                            alinea.str = alinea.str + "" + data.str; // n = enter for new line support

                          }
                          else {
                            alinea.str = alinea.str + "\n" + data.str; // n = enter for new line support
                          }
                        }






                        if (typeof alinea.oldposy === undefined && alinea.oldposy == 0) {
                          alinea.oldposy = data.transform[5];
                        }

                      }


                      else {

                      }
                      alinea.backupY = data.transform[5];
                      if (req.query.mode == 'debug') {
                        console.log(data);
                      }
                      //If difference of next one is still part of this alinea then procceed
                      if (((alinea.backupY - data_next.transform[5]) < alinea.max_allowance && (alinea.backupY - data_next.transform[5]) >= 0 && ((data_next.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines)) < 2) || (alinea.backupY - data_next.transform[5]) == 0) && data_next != 'last') {
                        if (req.query.mode == 'debug') {

                          console.log('| string: ' + alinea.str);
                          console.log('----');
                        }
                        // console.log('| distance is: ' + (alinea.backupY - data_next.transform[5]) + '...');
                        // console.log('| string: ' + alinea.str);
                        // console.log('| data_string: ' + data.str);

                        // console.log('| next one is part of this alinea still...');

                      }
                      else {

                        if (data.colour != alinea.colour && alinea.diff_colour == true) { // if last string is different colour from the main alinea
                          // alinea.str = alinea.str + '</span>'; 
                        }
                        if (req.query.mode == 'debug') {
                          console.log('--push--');
                          console.log('| Color alinea vs string : ' + alinea.colour + '   vs   ' + data.colour);
                          console.log('| Parameter 1: Y(<20) ' + ((alinea.backupY - data_next.transform[5]) < alinea.max_allowance) + '   |   ' + ((alinea.backupY - data_next.transform[5]))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                          console.log('| Parameter 2: Y(0>)  ' + ((alinea.backupY - data_next.transform[5]) >= 0) + '   |   ' + ((alinea.backupY - data_next.transform[5]))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                          console.log('| Parameter 3: X(<2)  ' + (data_next.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines) < 2) + '   |   ' + (data_next.transform[4] - alinea.oldposx - (alinea.max_allowance * alinea.lines))); // I've a exam on the 23th of march but it's so far away :/, let me send a mail to school, maybe I can reschedule it
                          console.log('| distance is: ' + (alinea.backupY - data_next.transform[5]) + '...');
                          console.log('| Alinea_string: ' + alinea.str);
                          console.log('| next_string: ' + data_next.str);

                          // if (typeof alinea.str=== 'undefined') {
                          console.log('| data_string: ' + data.str); //That was because I don't know whether they can reschedule it but you're more important to me so if I have to choose between you and a presentation I'm choosing you
                          // }
                          console.log('| pushingthis alinea ...');
                        }
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
                        temp_formatted.elements.settings.color = alinea.colour; //picks only the last colour
                        // console.log('-----------------error below-----------------');
                        // console.log(alinea.extra_colour);
                        // console.log('-----------------error above-----------------');
                        temp_formatted.elements.settings.color_extra = JSON.parse(JSON.stringify(alinea.extra_colour));
                        temp_formatted.elements.settings.spacing = data.spacing;
                        temp_formatted.elements.settings.fontSize = alinea.fontSize;


                        console.log(temp_formatted.elements.settings.color_extra);



                        formatted.pages.push(JSON.parse(JSON.stringify(temp_formatted)));

                        // console.log("=============================== === === === === === === === === === === === === === === === === === === == ");
                        // console.log('temp_formatted :   ' + temp_formatted.elements.settings.text);
                        // console.log('data     :   ' + JSON.stringify(data));
                        // console.log("=======================================================================================");
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
                        alinea.diff_colour = false;
                        alinea.colour = ''; //set alinea colour
                        alinea.oldposx = data.transform[4];
                        alinea.oldposy = data.transform[5];
                        alinea.extra_colour = new Array();

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

                      // console.log(src_data);
                      for (var e = 0; e < src_data.length; e++) {
                        console.log('imagine equal  |  ' + (src_data[e].id == data.image_name) + "  |  " + src_data[e].id + "  | Moet gelijk zijn aan |  " + data.image_name);
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
                      // console.log('y :                          ' + y);
                      // console.log('Temp_string :                ' + temp_string);

                      // console.log(y == temp_string);
                      // console.log();

                    } //END if


                    temp_formatted.elements = {};
                  } // END page = x loop

                } // Element try loop
                catch (err) {} // END IF PAGE = correct PAGE loop




              } // FORCED IF TO CHECK WHETHER PAGE EVEN EXISTS
              // console.log();

            } // END pages loop

            fs.writeFileSync("./logs/formatted.js", JSON.stringify(formatted, null, 4)); //no idea what
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
