$(function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var dragging = false;

    var borderWidth = 1;
    var canvasX = $("#canvas").offset().left + borderWidth; 
    var canvasY = $("#canvas").offset().top + borderWidth;

    var prevX = null;
    var prevY = null;

    $("#canvas").mousedown(function() {
        dragging = true;
    })
    .mouseup(function() {
        dragging = false;
        prevX = null;
        prevY = null;
    })
    .mouseout(function() {
        dragging = false;
        prevX = null;
        prevY = null;
    })
    .mousemove(function(event) {
        if(dragging) {
            var x = event.pageX - canvasX;
            var y = event.pageY - canvasY;
            ctx.beginPath();
            if(prevX == null) {
                ctx.moveTo(x, y);
            } else {
                ctx.moveTo(prevX, prevY);
            }
            ctx.lineTo(x, y);
            ctx.stroke();
            prevX = x;
            prevY = y;
        }
    });
    setImage(1, "sample.jpg", 200, 200, 1000, 1000);
    setImage(2, "sample.jpg", 300, 400, 600, 700);
    setImage(3, "sample.jpg", 600, 600, 700, 700);

    function setImage(num, path, left, top, right, bottom) {
        // size in html
        var width = $("#image" + num).width();
        var height = $("#image" + num).height();
        var selector = "#image" + num + " img";
        $(selector).attr("src", "image/" + path);
        // original size of the image
        var origWidth = $(selector).width();
        var origHeight = $(selector).height();

        var ratio = width / (right - left);
        $(selector)
        .width(origWidth * ratio)
        .css("left", "-" + (left * ratio) + "px")
        .css("top", "-" + (top * ratio) + "px");
    }
});
