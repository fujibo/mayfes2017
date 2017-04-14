$(function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var dragging = false;

    var borderWidth = 1;
    var canvasX = $("#canvas").offset().left + borderWidth; 
    var canvasY = $("#canvas").offset().top + borderWidth;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var prevX = null;
    var prevY = null;

    $("#canvas").mousedown(function() {
        dragging = true;
    })
    .mouseup(function() {
        if(dragging) finishDrawing();
    })
    .mouseout(function() {
        if(dragging) finishDrawing();
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
    setImage(1, "image/sample.jpg", 200, 200, 1000, 1000);
    setImage(2, "image/sample.jpg", 300, 400, 600, 700);
    setImage(3, "image/sample.jpg", 600, 600, 700, 700);

    function finishDrawing() {
        dragging = false;
        prevX = null;
        prevY = null;
        var pngData = canvas.toDataURL().split(',')[1];
        console.log(pngData);
        $.ajax({
            url: "http://localhost:8080/searching",
            type: "POST",
            cache: false,
            data: {
                "image": pngData
            },
            dataType: "json",
            success: handleResponse
        });
    }

    function handleResponse(data, dataType) {
        // TODO: show images
    }

    function setImage(num, path, left, top, right, bottom) {
        // size in html
        var width = $("#image" + num).width();
        var height = $("#image" + num).height();
        var $img = $("#image" + num + " img");
        $img.attr("src", path);
        // original size of the image
        var origWidth = $img.width();
        var origHeight = $img.height();

        var ratio = width / (right - left);
        $img.width(origWidth * ratio)
            .css("left", "-" + (left * ratio) + "px")
            .css("top", "-" + (top * ratio) + "px");
    }
});
