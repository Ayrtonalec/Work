// exports.jsonFactory = class {
class jsonFactory {


    constructor() {

        this.object = new Array();

        this.object["textgroup"] = new Array();
        this.object["textgroup"]["elements"] = new Array();
        // this.object["textgroup"]["elements"]['tspan'] = '';
        // this.object["textgroup"]["elements"]['style'] = '';
        // this.object["textgroup"]["elements"]['path'] = '';
        // this.object["textgroup"]["elements"]['clipPath'] = '';
        // this.object["textgroup"]["elements"]['rect'] = '';
        // this.object["textgroup"]["elements"]['image'] = '';
        // this.object["textgroup"]["elements"]['mask'] = '';
        // this.object["textgroup"]["elements"]['defs'] = '';



    }
    createElement(a, b) {
        var t = Array();
        switch (a) {
            case 'style':
                // code
                // this.object['textgroup']['elements']['style'].push(b);
                t.style = b;
                break;
            case 'text': // = element
                // code
               t.text = b;
                break;
            case 'tspan':
                t.tspan = b;
                // code
                break;
            case 'g': // main group



                // var t = Array();
                // // t.title = 'ss';

                // this.object['textgroup']['elements'].push(t);


                // console.log(this.object.textgroup);
                // code
                break;

            default:
                // code

             
        }
           this.object['textgroup']['elements'].push(t);
               return this;
    }
}

module.exports = jsonFactory;
