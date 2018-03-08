class Storage {
    constructor() {
        console.log('src is... prepaired and class is... loaded!');
        this.src = new Array();
    }

    set_src(src, id) {
        var p = new Array();
        p.id = id;
        p.src = src;
        this.src.push(p);
        console.log(id + ' is set!');
    }
    get_src() {
        console.log('retreived!');
        return this.src;
    }

}
module.exports = new Storage();
