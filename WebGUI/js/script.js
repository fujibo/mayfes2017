$(function() {
    var imageDir = "image/";

    var lineWidth = 2;
    var eraseWidth = 10;
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
    $("#eraseWidth").text(eraseWidth);
    $("#slider").slider({
        min: 1,
        max: 30,
        range: "min",
        value: lineWidth,
        slide: function(event, ui) {
            lineWidth = ui.value;
            $("#lineWidth").text(lineWidth);
        }
    });
    $("#eraseSlider").slider({
        min: 1,
        max: 50,
        range: "min",
        value: eraseWidth,
        slide: function(event, ui) {
            eraseWidth = ui.value;
            $("#eraseWidth").text(eraseWidth);
        }
    });
    $("#btn_undo").button({
        icon: "ui-icon-arrowreturnthick-1-w"
    }).click(function() {
        undo();
    });
    $("#btn_redo").button({
        icon: "ui-icon-arrowreturnthick-1-e"
    }).click(function() {
        redo();
    });
    $("#btn_clear").button({
        icon: "ui-icon-close"
    }).click(function() {
        clear();
    });
    $("#edit_group").controlgroup();

    var borderWidth = 1;
    var canvasX = $("#canvas").offset().left + borderWidth;
    var canvasY = $("#canvas").offset().top + borderWidth;

    $(window).resize(function() {
        canvasX = $("#canvas").offset().left + borderWidth;
        canvasY = $("#canvas").offset().top + borderWidth;
    });

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var canvas_dragging = false;

    var NUM_UNDO = 20;
    var undoImages = [];
    var redoImages = [];

    var image_dragging = null;

    var canvasWidth = $("#canvas").width();
    var canvasHeight = $("#canvas").height();

    var prevX = null;
    var prevY = null;

    clear();

    $("#canvas").mousedown(function() {
        canvas_dragging = true;
    })
    .mouseup(function() {
        if(canvas_dragging) onDraw(0);
    })
    .mouseleave(function() {
        if(canvas_dragging) onDraw(0);
    })
    .mousemove(function(event) {
        if(canvas_dragging) {
            var x = event.pageX - canvasX;
            var y = event.pageY - canvasY;
            ctx.beginPath();
            ctx.strokeStyle = is_pen ? "black" : "white";
            ctx.lineWidth = is_pen ? lineWidth : eraseWidth;
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
    });

    setImage(1, "sample.jpg", 100, 0, 200, 400);
    setImage(2, "sample.jpg", 0, 0, 640, 400);
    setImage(3, "sample.jpg", 500, 100, 640, 400);

    $("div .images").each(function(i, element) {
        $(element).draggable({
            opacity: 0.7,
            helper: "clone",
            start: function(event, ui) {
                image_dragging = i + 1;
            },
            stop: function(event, ui) {
                var xs = event.pageX;
                var ys = event.pageY;
                if(canvasX <= xs && canvasY <= ys && canvasX + canvasWidth >= xs && canvasY + canvasHeight >= ys) {
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
                    onDraw(1);
                }
            }
        })
        .click(function(event) {
          if($("#manga_page_img").length === 0) {
            $(".manga_page").append("<img src=\"" + $(this).find('img').attr("src") + "\" id=\"manga_page_img\"/>");
            $(".manga_page").append("");
            $(".manga_page").append("<div class=\"square\"style=\"position:absolute;\"/>");
            $(".manga_page").append("<button id=\"btn-close\" class=\"ui-widget ui-button\" style=\"position: absolute; right: 0px; top: 0px\"></button>");
            $("#center").width("30%");
            $("#right").css("display", "inline-block");
            $("#btn-close").button({
              icon: "ui-icon-close"
            }).click(function(event) {
              $("#manga_page_img").remove();
              $("#btn-close").remove();
              $("#right").css("display", "none");
              $(".square").remove();
              $("#center").width("65%");
              $("#title").text("");
              $("#page").text("");
            });
          } else {
            $("#manga_page_img").attr({"src":$(this).find('img').attr("src")});
          }

          var origWidth = $(this).find('img').width();
          var baseWidth = $(".manga_page").width();
          var ratio = baseWidth * 2 / origWidth;

          var windowWidth = $(this).width();
            
          $(".square").css("width", ratio * windowWidth+"px");
          $(".square").css("height", ratio * windowWidth+"px");
          $(".square").css("top", - ratio * $(this).find('img').position().top);

          $("#title").text($(this).find('img').attr("data-title"));
          $("#page").text($(this).find('img').attr("data-page"));

          if(Math.abs($(this).find('img').position().left) > ($(this).find('img').width() / 2)) {
            $("#manga_page_img").width(origWidth * ratio)
              .css("margin", "0px")
              .css("left", (-baseWidth) + "px");
            $(".square").css("left", - ratio * $(this).find('img').position().left - baseWidth);
          } else {
            $("#manga_page_img").width(origWidth * ratio)
              .css("margin", "0px")
              .css("left", "0px");
            $(".square").css("left", - ratio * $(this).find('img').position().left);
            }
        });
    });

    function finishDrawing(is_new) {
        canvas_dragging = false;
        prevX = null;
        prevY = null;
        var pngData = canvas.toDataURL().split(',')[1];
        $.ajax({
            url: "http://localhost:8080/searching",
            type: "POST",
            cache: false,
            data: {
                "image": pngData,
                "new": is_new
            },
            dataType: "json"
        })
        .done(function(res) {
            var imgs = res.imgs;
            $.each(imgs, function(i, img) {
                setImage(i+1, img.path, img.x1, img.y1, img.x2, img.y2, img.title, img.page);
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
        onDraw(1);
    }

    function onDraw(is_new) {
        if(redoImages.length > 0) redoImages = [];
        saveForUndo();
        finishDrawing(is_new);
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

    function setImage(num, path, left, top, right, bottom, title, page) {
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
            $img.attr("data-title",title);
            $img.attr("data-page", page);
        };
        image.src = url;
    }
});
