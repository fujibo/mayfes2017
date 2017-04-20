$(function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var canvas_dragging = false;
    var in_canvas = false;

    var image_dragging = null;

    var borderWidth = 1;
    var canvasX = $("#canvas").offset().left + borderWidth; 
    var canvasY = $("#canvas").offset().top + borderWidth;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var prevX = null;
    var prevY = null;

    $("#canvas").mousedown(function() {
        canvas_dragging = true;
    })
    .mouseup(function() {
        if(canvas_dragging) finishDrawing();
        if(image_dragging != null) {
            var image = new Image();
            var $target_div = $("#image" + image_dragging);
            var $target_img = $("#image" + image_dragging + " img");
            image.src = $target_img.attr("src");

            var div_width = $target_div.width();
            var div_height = $target_div.height();
            var img_width = $target_img.width();
            var img_height = $target_img.height();
            var ratio = image.width / img_width;
            var left = parseFloat($target_img.css("left"));
            var top = parseFloat($target_img.css("top"));
            ctx.drawImage(image, -left * ratio, -top * ratio, div_width * ratio, div_height * ratio,
                0, 0, $("#canvas").width(), $("#canvas").height());
            image_dragging = null;
        }
    })
    .mouseleave(function() {
        if(canvas_dragging) finishDrawing();
        in_canvas = false;
    })
    .mousemove(function(event) {
        if(canvas_dragging) {
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
    })
    .mouseover(function() {
        in_canvas = true;
    });
    
    setImage(1, "image/sample.jpg", 100, 100, 200, 200);
    setImage(2, "image/sample.jpg", 0, 0, 400, 400);
    setImage(3, "image/sample.jpg", 200, 0, 600, 400);

    $("html").mouseleave(function() {
        image_dragging = null;
    })
    .mouseup(function() {
        if(!in_canvas) image_dragging = null;
    });
    
    $("div .images").each(function(i, element) {
        $(element).mousedown(function(event) {
            event.preventDefault();
            image_dragging = i + 1;
        });
    });

    function finishDrawing() {
        canvas_dragging = false;
        prevX = null;
        prevY = null;
        var pngData = canvas.toDataURL().split(',')[1];
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
        
        // original size of the image
        var origWidth = $img.width();
        var origHeight = $img.height();
        var ratio = width / (right - left);
        
        var image = new Image();
        image.onload = function() {
            $img.attr("src", path);
            // original size of the image
            var origWidth = $img.width();
            var origHeight = $img.height();
            var ratio = width / (right - left);
            $img.width(origWidth * ratio)
                .css("left", "-" + (left * ratio) + "px")
                .css("top", "-" + (top * ratio) + "px");
        };
        image.src = path;
    }
});
