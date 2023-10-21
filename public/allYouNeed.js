var kkeys = [], konami = "38,38,40,40,37,39,37,39,66,65";

$(document).keydown(function(e) {

    kkeys.push( e.keyCode );

    if ( kkeys.toString().indexOf( konami ) >= 0 ) {

        $(document).unbind('keydown',arguments.callee);

        animateIMG()

    }

});

function makeNewPosition(){

    // Get viewport dimensions (remove the dimension of the div)
    var h = $(window).height() - 50;
    var w = $(window).width() - 50;

    var nh = Math.floor(Math.random() * h);
    var nw = Math.floor(Math.random() * w);

    return [nh,nw];

}

function animateIMG(){
    var newq = makeNewPosition();
    $('#imgAlbert').show()
    $('img[value="animateAl"]').animate({ top: newq[0], left: newq[1] }, function(){
        animateIMG();
    });

};
