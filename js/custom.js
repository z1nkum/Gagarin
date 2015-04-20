var images_paths = ['images/wrench.png', 'images/can.png', ];
var spaceman_img = 'images/spaceman2.png';
var random_images = [];
var random_prob = 0.005;
var stuff_arr = [];
var max_speed = 30;
var max_angle_speed = 20;
var spaceman_plx = 20;
var spaceman_max_speed = 1;
var spaceman_jitter_prob = 0.05;
var ship_rotate = 0.3;
var ship_angle = 0;
var spaceman;

function preload(arr) {
    for ( var i = 0; i < arr.length; ++i ) {
        var obj = new Image();
        obj.src = arr[i];
        random_images.push(obj)
    }
}

preload(images_paths);

function findById(arr, id) {
    var obj = undefined;
    for ( var i = 0; i < arr.length; ++i ) {
        if ( arr[i].id == id ) obj = arr[i];
    }
    return obj;
}

function findNextId(arr){
    var id=0;
    for ( var i = 0; i < arr.length; ++i ) {
        if ( arr[i].id > id ) id = arr[i].id; // max id
    }
    return id+1
}

function flyingStuff(pos , v, rot, img, id) {
    this.id = (typeof id === 'undefined') ? findNextId(stuff_arr) : id;
    this.pos = pos;
    this.rot = rot;
    this.angle = 0;
    this.image = img;
    this.v = v;
    this.move = function () {
        this.pos[0] += this.v[0];
        this.pos[1] += this.v[1];
        this.angle += this.rot;
    };

    this.draw = function () {
        var rotationStr = "rotate(" + this.angle + "deg)";
        $(this.getEl()).css({
            "-webkit-transform": rotationStr,
            "-moz-transform": rotationStr,
            "transform": rotationStr,
            "left": this.pos[0],
            "top": this.pos[1]
        });
    };

    this.jitter = function (p) {
        // change v with probability p
        if ( Math.random() <= p ){
            this.v[0] *= -1
        }

        if ( Math.random() <= p ){
            this.v[1] *= -1
        }
    };

    this.away = function() {

        if ( (this.pos[0] + this.image.width * 2) < 0 && this.v[0] <= 0 ) {
            //console.log('away left');
            return true;
        }

        if ( (this.pos[1] + this.image.height * 2) < 0 && this.v[1] <= 0 ) {
            //console.log('away top');
            return true;
        }

        if ( (this.pos[0] > $(window).width()) && this.v[0] >= 0 ) {
            //console.log('away right');
            return true;
        }

        if ( ( ( this.pos[1] - this.image.height * 2 ) > ($(window).height() + $(document).scrollTop()) ) && this.v[1] >= 0 ) {
            //console.log('away bottom');
            return true;
        }

        return false;
    };

    this.str = function (){
        return this.id + ":[" + this.pos[0] + "," + this.pos[1] + "]:" + ":[" + this.v[0] + "," + this.v[1] + "]:" + this.angle + ":" + this.image.src;
    }

    this.getEl = function(){
        return $('.flying-object[data-object-id="' + this.id + '"]');
    }
}

function pushObject(el) {
    var obj = findById(stuff_arr, el.data('object-id'));
    obj.rot *= -3;    obj.v[0] *= -2;
    obj.v[1] *= 2;
    console.log('push: ', obj.str());
}

function timeTick() {
    randomFly();
    shipRotate();
    spaceman.move();
    spaceman.draw();
    spaceman.jitter(spaceman_jitter_prob);
}

function shipRotate(){
    ship_angle += ship_rotate;
    var rotationStr = "rotate(" + ship_angle + "deg)";
    $("#space").css({
        "-webkit-transform": rotationStr,
        "-moz-transform": rotationStr,
        "transform": rotationStr
    });
}

function createImgDiv(obj) {
    var d = document.createElement('div');
    var i = document.createElement('img');
    i.src = obj.image.src;

    $(d).addClass('flying-object')
        .appendTo($("body"))
        .append($(i))
        .width(obj.image.width)
        .css({'z-index': 1000 + obj.id, 'left': obj.pos[0], 'top': obj.pos[1]})
        .click( function () { pushObject( $(this) ); } )
        .attr('data-object-id', obj.id);
}

function createSpaceman(image_path){
    var img = new Image();
    img.src = image_path;
    // var v = [ Math.floor(Math.random() * spaceman_max_speed - spaceman_max_speed/2), Math.floor(Math.random() * spaceman_max_speed - spaceman_max_speed/2) ];
    var v = [spaceman_max_speed, spaceman_max_speed]
    var pos = [20, 20];
    var rotate = 0;
    var obj = new flyingStuff(pos, v, rotate, img, -1);
    createImgDiv(obj);
    $(obj.getEl()).attr('id', 'spaceman');
    return obj;
}

function randomFly() {
    if ( Math.random() <= random_prob && random_images.length > 0 ) {
        // create new object
        var img = random_images[Math.floor(Math.random() * random_images.length)];
        var x = Math.floor(Math.random() * $(window).width());
        var y = Math.floor(Math.random() * $(window).height()) + $(document).scrollTop();
        var rand_pos = [[x, -1 * img.height] , [x, $(window).height() + $(document).scrollTop() + img.height], [-1 * img.width, y], [$(window).width() + img.width, y] ]; // random choices
        var pos = rand_pos[Math.floor(Math.random() * rand_pos.length)];
        var v = [ Math.floor(Math.random() * max_speed * -1), Math.floor(Math.random() * max_speed * -1) ];
        if ( pos[0] < 0 ) v[0] *= -1;
        if ( pos[1] < $(document).scrollTop() ) v[1] *= -1;

        var rotate = Math.floor(Math.random() * max_angle_speed  - max_angle_speed/2);
        var obj = new flyingStuff(pos, v, rotate, img);
        stuff_arr.push(obj);
        createImgDiv(obj);
    }

    var i = stuff_arr.length;
    while (i--) {
        // reverse loop - because of reindexing on object away
        var obj = stuff_arr[i];
        var dom = stuff_arr[i].getEl();
        obj.move();
        if ( obj.away() ) {
            stuff_arr.splice(i, 1);
            $(dom).remove();
        }

        obj.draw();

    }

    return true;
}

$(function() {
    setInterval(timeTick, 100);
    spaceman = createSpaceman(spaceman_img);

    var man_top =  parseInt( $(spaceman.getEl()).css("marginTop"), 10);
    var rotation = 0,
        scrollLoc = $(document).scrollTop();

    $(window).scroll(function() {
        var newLoc = $(document).scrollTop();
        var diff = scrollLoc - newLoc;
        var top = man_top - Math.round(newLoc/spaceman_plx) + 'px';
        rotation += diff/15, scrollLoc = newLoc;
        var rotationStr = "rotate(" + rotation + "deg)";
        spaceman.pos[1] = top;
        spaceman.angle = rotation;
        $(spaceman.getEl()).css({
            "-webkit-transform": rotationStr,
            "-moz-transform": rotationStr,
            "transform": rotationStr,
            "top": top
        });
    });
});