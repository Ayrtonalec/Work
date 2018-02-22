const util = require('util')
class Operator {


    constructor(doc) {

        console.log('# Document Loaded');
        this.page_data = {};
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
        console.log(lastPromise);
    }
    pageInfo(pageNum, viewport, callback) {


        this.page_data.page_num = pageNum;
        this.page_data.width = viewport.width;
        this.page_data.height = viewport.height;
        return callback(this);
    }
    getText(page, paginfo, content, Callback) {
        var length = 0;
         var arr = new Array();
         var counter = 0;
            var c = 0;
        page.getOperatorList().then(function(ops) {
            length = ops.fnArray;
            var a = 0;
            
            var t = 'false';
            var u = 0;
            var arg = '';
           

            for (var i = 0; i < ops.fnArray.length; i++) {
                // console.log(util.inspect(ops.argsArray[i], false, null))
                // console.log('# ' + i + '  :   ' + ops.fnArray [i]);
                u = ops.fnArray[i];
                arg = ops.argsArray[i];
                if(typeof arr[c] === 'undefined'){
                    console.log('Page +:  ' + c);
                arr[c] = new Array();  //page
                }
                if(typeof arr[c][counter] === 'undefined'){
                    console.log('Add Counter +:  ' + counter);
                arr[c][counter] = new Array();  //counter
                }
                if (u == 59 || u == 44) {
                    if (u == 59) { // RGB
                        arr[c].push(arg);
                    }
                    else if (u == 44) { // Text
                    arr[c][counter].push(arg);
                     console.log('Arrrrrrrrrr:  ');
                    // console.log(arr);
                    counter++;
                    }
                    // for (a = i+3; a >= (i - 3); a--) {
                    //     console.log();
                    //                 //   console.log('Fill');
                    // console.log(ops.argsArray[i]);
                    //                 //   console.log();
                    // }
                }
            }
           
        });
        c++;
         console.log('Arrrrrrrrrr:  ');
            console.log(arr);
        // return;
        var Content_array = Array();

        var i = 0; // used for page numbering
        var counter = 0; // used for page numbering


        var strings = content.items.map(function(item) {
            delete item.dir;
            //           console.log('Item:;:          -  ' + counter++);
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

            for (var i = 0; i < ops.fnArray.length; i++) {
                // console.log(util.inspect(ops.argsArray[i], false, null))
                console.log('# ' + i + '  :   ' + ops.fnArray[i]);
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
