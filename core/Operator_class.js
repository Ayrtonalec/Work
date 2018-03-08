const util = require('util');
var fs = require('fs');
class Operator {


    constructor(doc) {
        this.rgbdata = new Array();
        console.log('# Document Loaded');
        this.page_data = {};
    }
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    getMeta(doc, callback) {
        console.log('Number of Pages: ' + doc.numPages);
        // console.log();




        var Meta_data = {}; //Used to push data
        var lastPromise = doc.getMetadata().then(function(data) {
            console.log('# Metadata Is Loaded and pushed');
            console.log('## Info');

            Meta_data = (data.info);

            if (data.metadata) {
                // //     More detailed metadata but a bit cryptic
                // console.log('## Metadata');
                // console.log(JSON.stringify(data.metadata.getAll(), null, 2));
                // console.log();
            }

            return callback(Meta_data);

        });

    }
    pageInfo(pageNum, viewport, callback) {
        this.page_data.page_num = pageNum;
        this.page_data.width = viewport.width;
        this.page_data.height = viewport.height;
        return callback(this);
    }
    getText(page, paginfo, content, numPages, data, Callback) {




        var length = 0;

        var counter = 0;



        if (typeof arr === 'undefined') {
            var arr = new Array();

        }



        page.getOperatorList().then(function(ops) { // Loop through 4 times, for each page once

            var Temp_array = new Array();

            length = ops.fnArray;
            var a = 0; // Not used

            var t = 'false'; // Not used
            var u = 0; //initiate for OPS
            var arg = ''; //used for ARG


            for (var i = 0; i < ops.fnArray.length; i++) {


                // console.log(util.inspect(ops.argsArray[i], false, null))
                // console.log('# ' + i + '  :   ' + ops.fnArray [i]);
                u = ops.fnArray[i]; //
                if (typeof ops.argsArray[i] !== 'undefined') {

                    if (ops.argsArray[i] != null) {

                        var temp = ops.argsArray[i];
                        arg = Array.from(temp);





                    }
                }

                if (u == 59 || u == 44 || u == 9 || u == 32) { // Loop through 51 -49 -39 -39


                    switch (u) {
                        case 59:
                            // console.log('RGB Init: ')



                            Temp_array.push({ hex: "#" + ((1 << 24) + (arg[0] << 16) + (arg[1] << 8) + arg[2]).toString(16).slice(1) });

                            // code
                            break;
                        case 44:

                            var parts = '';
                            for (var p = 0; p < arg[0].length; p++) {

                                var part = arg[0][p]; // Part
                                if (isNaN(part)) {
                                    parts = parts + part.unicode
                                }

                            }
                            //  console.log(parts);
                            // return;
                            Temp_array.push(parts);
                            // code, breakdown letters to words 
                            break;
                        case 32:
                            // code
                            // console.log('Closure Init: ')
                            // console.log(Temp_array);
                            data.push(Temp_array);
                            Temp_array = new Array();
                            break;


                    }

                }


            } //foreach


        });


        var old_hex = '';
        var Content_array = Array();

        var i = 0; // used for page numbering
        var counter = 0; // used for page numbering


        var strings = content.items.map(function(item) {
            // console.log(item.str);
            // return;

            for (var p = 0; p < data.length; p++) {

                if (typeof data[p][0].hex === 'undefined' || typeof data[p][0].hex !== 'undefined') {
                    // console.log(data[p]);
                    // for(var q = 0; q < data.length; q++){
                    for (var d = 0; typeof data[p][d].hex !== 'undefined'; d++) {

                        // console.log(d);

                        counter = d;
                    }

                    console.log(item.str + '       ||||' + counter + '||||       ' + data[p][d]);
                    // }


                    if (data[p][d] == item.str) {

                        console.log('Match!');
                        for (var g = 0; g < 99; g++) {
                            if (typeof data[p - g - 1] !== 'undefined') {
                                if (typeof data[p - g - 1][0].hex !== 'undefined') {



                                    item.colour = data[p - g - 1][0].hex;
                                    old_hex = data[p - g - 1][0].hex;
                                    //   console.log('Other data --->' + data[p-g-1][0].hex);
                                    //   console.log(data[p-g-0][0]);

                                    g = 99;
                                    break;

                                }
                            }


                        }

                        break;
                    } // if item == Match!



                } // Useless

                if (p == data.length - 1) {
                    item.colour = old_hex;
                    console.log('Failed to match :(');
                }
            } /// for loop



            delete item.dir;
            //   console.log('Item:;:          -  ' + counter++);
            // console.log(item);
            item.page = paginfo.page_data.page_num;
            // console.log('Pagedata: #' + i);
            // console.log(paginfo);
            if (i < paginfo.page_data.page_num) {

                Content_array.push(paginfo.page_data); //PageData

            }
            i = paginfo.page_data.page_num; //used for page numbering

            Content_array.push(item);
            // console.log(item);
            return item.str;
        });
        return Callback(Content_array);
    }

    getImage(page, pdfjsLib, paginfo, callback) {


        var load = 'false';
        var result = {};
        var result_t = new Array();
        var counter = 0;
        var length = 0;

        //@todo: get image data preferable base64
        page.getOperatorList().then(function(ops) {
            length = ops.fnArray;
            var a = 0;
            var t = 'false';
            fs.writeFileSync("./logs/" + 'Args_data' + ".js", JSON.stringify(ops.argsArray, null, 4));
            for (var i = 0; i < ops.fnArray.length; i++) {
                // console.log(util.inspect(ops.argsArray[i], false, null))
                // console.log('# ' + i + '  :   ' + ops.fnArray[i]);
                // if(ops.fnArray[i] == 22){
                //     for (a = i+3; a >= (i - 3); a--) {
                //         console.log();
                //                     //   console.log('Fill');
                //         // console.log(ops.argsArray[a]);
                //                     //   console.log();
                //     }

                // }

                // console.log(ops.fnArray[i]);
                if (ops.fnArray[i] >= 82 && ops.fnArray[i] < 91) {


                    // console.log('RECOGNIZE ------------------------ ' + i + ' --------------------');
                    // console.log('# ' + ops.fnArray[i]);

                    for (a = i; a >= (i - 3) && t == 'false'; a--) {

                        if (typeof ops.argsArray[a][0] !== 'undefined') {

                            if (ops.argsArray[a][0] == ops.argsArray[i][1]) {
                                result.page = paginfo.page_data.page_num;
                                result.image_scale_width = ops.argsArray[a][0];
                                result.image_scale_height = ops.argsArray[a][3];
                                result.image_rotation_x = ops.argsArray[a][1];
                                result.image_rotation_y = ops.argsArray[a][2];


                                result.image_x = ops.argsArray[a][4];
                                result.image_y = ops.argsArray[a][5];
                                t = 'true';
                            }
                            else if (ops.argsArray[a][0] > 0) {
                                result.page = paginfo.page_data.page_num;
                                result.image_scale_width = ops.argsArray[a][0];
                                result.image_scale_height = ops.argsArray[a][3];
                                result.image_rotation_x = ops.argsArray[a][1];
                                result.image_rotation_y = ops.argsArray[a][2];
                                result.image_x = ops.argsArray[a][4];
                                result.image_y = ops.argsArray[a][5];
                            }
                        }

                    }


                    result.image_name = ops.argsArray[i][0]; // img_p0_1
                    result.image_width = ops.argsArray[i][1]; // 250
                    result.image_height = ops.argsArray[i][2]; // 250






                    result_t.push(result);



                    result = {};
                    t = 'false';

                    a++;

                    // console.log('RECOGNIZE --------------------------------------------');

                }
                counter++;

            }

            return callback(result_t);
        });


        var _flagCheck = setInterval(function() { //Checking whether load is set to true
            if (counter >= length.length) {
                console.log('counter:  ' + counter + '   Length:   ' + length.length)
                clearInterval(_flagCheck);
                // console.log(result_t);
                return callback(result_t);
            }
        }, 500); // interval set at 500 milliseconds


    }
    getPath(page, pdfjsLib, doc, paginfo, callback) {
        var xx = 0; //Worthless
        function pf(value) {
            if (Number.isInteger(value)) {
                return value.toString();
            }
            var s = value.toFixed(10);
            var i = s.length - 1;
            if (s[i] !== '0') {
                return s;
            }
            do {
                i--;
            } while (s[i] === '0');
            return s.substr(0, s[i] === '.' ? i : i + 1);
        }
        var load = 'false';
        var result = {};
        var result_t = {};
        var counter = 0;
        var length = 0;


        page.getOperatorList().then(function(ops) {
            length = ops.fnArray;








            for (var w = 0; w < ops.fnArray.length; w++) {



                xx++; // infinate loop Detection
                if (xx >= 855) {
                    console.log('infinate Loop detected');
                    console.log('Destroying...');
                    return;
                } // End 555


                if (ops.fnArray[w] == 91) {


                    var ops_n = ops.argsArray[w][0];
                    var args = ops.argsArray[w][1];
                    //  console.log(ops.argsArray[i]);

                    var x = 0;
                    var y = 0;

                    var d = [];
                    d.page = paginfo.page_data.page_num;
                    var opLength = ops_n.length;

                    // console.log();
                    // console.log();
                    // console.log();
                    // console.log('OPS');
                    // console.log();
                    // console.log(ops.argsArray[w]);
                    // console.log();
                    // console.log();
                    // console.log();
                    // console.log();
                    // console.log();

                    for (var i = 0, j = 0; i < opLength; i++) {
                        switch (ops_n[i] | 0) {
                            case 19: // rectangle
                                x = args[j++];
                                y = args[j++];
                                var width = args[j++];
                                var height = args[j++];
                                var xw = x + width;
                                var yh = y + height;
                                d.push('M', pf(x), pf(y), 'L', pf(xw), pf(y), 'L', pf(xw), pf(yh), 'L', pf(x), pf(yh), 'Z');

                                break;
                            case 13: //moveTo
                                x = args[j++];
                                y = args[j++];
                                d.push('M', pf(x), pf(y));
                                break;
                            case 14: //lineTo
                                x = args[j++];
                                y = args[j++];
                                d.push('L', pf(x), pf(y));
                                break;
                            case 15: //curveTo
                                x = args[j + 4];
                                y = args[j + 5];
                                d.push('C', pf(args[j]), pf(args[j + 1]), pf(args[j + 2]), pf(args[j + 3]), pf(x), pf(y));
                                j += 6;


                                break;
                            case 16: //curveTo2
                                x = args[j + 2];
                                y = args[j + 3];
                                d.push('C', pf(x), pf(y), pf(args[j]), pf(args[j + 1]), pf(args[j + 2]), pf(args[j + 3]));
                                j += 4;
                                break;
                            case 17: //curveTo3
                                x = args[j + 2];
                                y = args[j + 3];

                                d.push('C', pf(args[j]), pf(args[j + 1]), pf(x), pf(y), pf(x), pf(y));
                                j += 4;
                                break;
                            case 18: //closePath
                                d.push('Z');
                                break;
                        }
                    }


                }
                counter++;

            } // why <p> there is no need </p> to do this <p> is there </p> no <h3> there </h3>

            //     console.log('=====---------========---------=b=e=g=i=n=-------=======-------========')
            //   console.log(d);
            //             console.log('=====---------========---------==e=n=d==-------=======-------========')
            return callback(d);
        });

    }


}

module.exports = new Operator();
