$(function() {
    var imageDir = "";

    var lineWidth = 2;
    $(window).keydown(function(e) {
        if(e.ctrlKey) {
            if(e.keyCode == 90) undo();
        }
    });
    var is_pen = true;
    $(".tools").checkboxradio();
    $("#radio_pen").click(function() {
        is_pen = true;
    });
    $("#radio_erase").click(function() {
        is_pen = false;
    });
    $("#radio_pen").click();
    $("#tools_group").controlgroup();
    $("#lineWidth").text(lineWidth);
    var slider = $("#slider").slider({
        min: 1,
        max: 10,
        range: "min",
        value: lineWidth,
        slide: function(event, ui) {
            lineWidth = ui.value;
            $("#lineWidth").text(lineWidth);
        }
    });
    $("#btn_undo").button().click(function() {
        undo();
    });
    $("#btn_redo").button().click(function() {
        redo();
    });
    $("#btn_clear").button().click(function() {
        clear();
    });
    $("#edit_group").controlgroup();

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var canvas_dragging = false;
    var in_canvas = false;

    var NUM_UNDO = 10;
    var undoImages = [];
    var redoImages = [];

    var image_dragging = null;

    var borderWidth = 1;
    var canvasX = $("#canvas").offset().left + borderWidth;
    var canvasY = $("#canvas").offset().top + borderWidth;

    var prevX = null;
    var prevY = null;

    clear();

    $("#canvas").mousedown(function() {
        canvas_dragging = true;
    })
    .mouseup(function() {
        if(canvas_dragging) onDraw();
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
            // clear before paste
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(image, -left * ratio, -top * ratio, div_width * ratio, div_height * ratio,
                0, 0, $("#canvas").width(), $("#canvas").height());
            image_dragging = null;
            onDraw();
        }
    })
    .mouseleave(function() {
        if(canvas_dragging) onDraw();
        in_canvas = false;
    })
    .mousemove(function(event) {
        if(canvas_dragging) {
            var x = event.pageX - canvasX;
            var y = event.pageY - canvasY;
            ctx.beginPath();
            ctx.strokeStyle = is_pen ? "black" : "white";
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
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

    setImage(1, "image/sample.jpg", 100, 0, 200, 400);
    setImage(2, "image/sample.jpg", 0, 0, 640, 400);
    setImage(3, "image/sample.jpg", 200, 0, 600, 400);

    $("html").mouseleave(function() {
        image_dragging = null;
    })
    .mouseup(function() {
        if(!in_canvas) image_dragging = null;
    });

    $("div .images").each(function(i, element) {
        $(element).draggable({opacity: 0.7, helper: "clone"}).mousedown(function(event) {
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
            dataType: "json"
        })
        .done(function(res) {
            var imgs = res.imgs;
            $.each(imgs, function(i, img) {
                setImage(i+1, img.path, img.x1, img.y1, img.x2, img.y2);
            });
        });
        $("div .images").map(function(idx, element) {
          $(element).css({"position":"relative"})
          $(element).children("img").attr({"src":"image/ajax-loader.gif"});
          $(element).children("img").css({"position":"absolute", "top":0, "right":0, "bottom":0, "left":0, "margin":"auto", "width":60});
        });
    }

    function clear() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onDraw();
    }

    function onDraw() {
        if(redoImages.length > 0) redoImages = [];
        saveForUndo();
        finishDrawing();
    }

    function saveForUndo() {
        if(undoImages.length >= NUM_UNDO) {
            undoImages.shift();
        }
        undoImages.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    function undo() {
        if(undoImages.length >= 2) {
            redoImages.push(undoImages[undoImages.length - 1]);
            undoImages.pop();
            ctx.putImageData(undoImages[undoImages.length - 1], 0, 0);
            finishDrawing();
        }
    }

    function redo() {
        if(redoImages.length >= 1) {
            ctx.putImageData(redoImages[redoImages.length - 1], 0, 0);
            redoImages.pop();
            saveForUndo();
            finishDrawing();
        }
    }

    function setImage(num, path, left, top, right, bottom) {
        // size in html
        var width = $("#image" + num).width();
        var height = $("#image" + num).height();
        var $img = $("#image" + num + " img");

        var url = imageDir + path;

        var image = new Image();
        image.onload = function() {
            $img.attr("src", url);
            // original size of the image
            var origWidth = image.width;
            var origHeight = image.height;
            if(right - left > bottom - top) {
                var expand = ((right - left) - (bottom - top)) / 2;
                bottom += expand;
                top -= expand;
            } else {
                var expand = ((bottom - top) - (right - left)) / 2;
                left -= expand;
                right += expand;
            }
            var ratio = width / (right - left);
            var posX = -left * ratio;
            var posY = -top * ratio;
            $img.width(origWidth * ratio)
                .css("left", posX + "px")
                .css("top", posY + "px")
                .css("margin", "0px");
        };
        image.src = url;
    }
});
