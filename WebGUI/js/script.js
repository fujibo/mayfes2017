$(function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var dragging = false;

    var borderWidth = 1;
    var canvasX = $("#canvas").offset().left + borderWidth; 
    var canvasY = $("#canvas").offset().top + borderWidth;
    console.log("x: " + canvasX + ", y: " + canvasY);

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
            console.log("x: " + x + ", y: " + y);
        }
    });
});
