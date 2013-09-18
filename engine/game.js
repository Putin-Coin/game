
Game = (function() {

    /*** State ***/

    var game = {};

    // Events
    var currentX,
        currentY,
        currentObj;

    // UI
    var body,
        views,
        panoContainer,
        contactContainer,
        displayContainer,
        lightContainer,
        examineIcon,
        takeIcon,
        display;

    // Values
    var values = {
        imagePath:          "images/{name}.png",
        iconImagePath:      "images/icons/{name}.png",
        iconHideTime:       3000,
        takeText:           "You have taken the {name}",
        panoZIndex: 1,
        areaZIndex: 2,
        itemZIndex: 3,
        lightZIndex: 4,
        displayZIndex: 5,
        contactZIndex: 6,
        iconZIndex: 7,
        iconWidth: 40,
        iconHeight: 40
    };


    /*** Methods ***/

    game.say = function(text) {

        // Show text
        display.html(text);
        display.fadeIn();

        // Hide on timer
        setTimeout(function() {
            display.fadeOut();
        }, 3000);

    };


    /*** Scenes ***/

    // params: name, items
    game.setScene = function(params) {

        // Load Scene
        Pano.load(params, function() {

            views = Pano.views;

            // Set items
            params.items.forEach(function(item) {
                game.setItem(item);
            });

            params.areas.forEach(function(area) {
                game.setArea(area);
            });

        });

    };

    // params: name, title, size, position, direction
    game.setItem = function(params) {

        // Validate
        ensure(
            params,
            params.name,
            params.direction,
            views[params.direction],
            params.position,
            params.position[0],
            params.position[1]
        );

        // Create image HTML
        var img = getItemHTML(params.name, params.position[0], params.position[1], params.size[0],  params.size[1], params.opacity);

        // Opacity
        if (params.opacity) img.css("opacity", params.opacity)

        // Append to cube hotspot
        var view = views[params.direction];
        view.append(img);

        // Events
        attachObjEvents(params, img);

    };

    // params: title, coords
    game.setArea = function(params) {

        // Validate
        ensure(
            params,
            params.title,
            params.coords
        );

        // Create HTML
        var area = getAreaHTML(params.coords);

        // Append to cube hotspot image map
        var view = views[params.direction];
        view.imageMap.append(area);

        // Events
        attachObjEvents(params, area);

    };

    function attachObjEvents(params, obj) {

        currentObj = obj;

        obj.click(function() {

            // Display helper title
            game.say(params.title);

            // Examine
            if (params.examine) {

                examineIcon.css({
                    left: currentX - 55,
                    top: currentY - 65
                }).fadeIn();

                examineIcon.click(function() {
                    game.say(params.examine);
                    hideIcons();
                });

            }

            if (params.take) {

                takeIcon.css({
                    left: currentX + 10,
                    top: currentY - 65
                }).fadeIn();

                takeIcon.click(function() {
                    obj.hide();
                    game.say(format(values.takeText, { name: params.title }));
                    hideIcons();
                });

            }

            // Hide icons on timer
            setTimeout(function() {
                hideIcons();
            }, values.iconHideTime);

        });

    }


    /*** Init ***/

    function initUI() {

        body = $("body");

        // Pano container
        panoContainer = getContainerHTML("pano", true, values.panoZIndex);
        body.append(panoContainer);

        // Contact container
        contactContainer = getContainerHTML("contact", false, values.contactZIndex);
        body.append(contactContainer);

        // Display container
        displayContainer = getContainerHTML("display", false, values.displayZIndex);
        body.append(displayContainer);

        // Light container
        lightContainer = getContainerHTML("light", false, values.lightZIndex);
        body.append(lightContainer);

        // Display
        display = getDisplayHTML();
        displayContainer.append(display);

        // Icons
        examineIcon = getIconHTML("examine");
        displayContainer.append(examineIcon);
        takeIcon = getIconHTML("take");
        displayContainer.append(takeIcon);

    }

    function initContactZone() {

        var startX, startY;

        body
        .mousedown(function(e) {
            startX = e.pageX;
            startY = e.pageY;
        })
        .mouseup(function(e) {

            if (startX == e.pageX && startY == e.pageY) {

                var svg = getContactSvgHTML(),
                    circle = $(svg.children()[0]),
                    i = 0;

                circle.attr("cx", e.pageX).attr("cy", e.pageY);
                contactContainer.append(svg);
                svg.show();

                var interval = setInterval(function() {
                    if (i == 12) {
                        clearInterval(interval);
                        svg.remove();
                        return;
                    }
                    var opacity = 1 - (.1 * i),
                        size = 1 + i;
                    svg.css("opacity", opacity);
                    circle.attr("r", size);
                    i++
                }, 50);

            }

            currentX = e.pageX;
            currentY = e.pageY;
            startX = null;
            startY = null;

        });

    }

    $(function() {
        initUI();
        initContactZone();
    });


    /*** HTML ***/

    function getItemHTML(name, x, y, width, height, opacity) {
        return $("<img>")
            .attr({
                "data-name": name,
                 src: format(values.imagePath, { name: name })
            })
            .css({
                position: "relative",
                left: x,
                top: y,
                height: height,
                width: width,
                opacity: opacity === undefined ? 1 : opacity,
                "pointer-events": "all"
            })
    }

    function getDisplayHTML() {
        return $("<div>").attr({
            id: "display",
            style: "display:none"
        })
    }

    function getAreaHTML(coords) {
        return $("<area>")
            .attr({
                shape: "poly",
                coords: coords,
                style: "cursor: pointer",
                href: "#"
            })
            .css({
                "cursor": "pointer",
                "pointer-events": "all"
            })
    }

    function getIconHTML(name) {
        return $("<img>")
            .attr({
                src: format(values.iconImagePath, { name: name })
            })
            .css({
                display: "none",
                cursor: "pointer",
                position: "absolute",
                width: values.iconWidth,
                height: values.iconHeight,
                "z-index": values.iconZIndex,
                "pointer-events": "all"
            })
    }

    function getContactSvgHTML() {
        // Must return HTML string here, dynamically creating element does not work
        return $('<svg style="display: none; position: absolute; width: 100%; height: 100%; pointer-events: none">' +
                    '<circle stroke="#fff" stroke-width="2" fill="none" />' +
                 '</svg>');
    }

    function getContainerHTML(name, pointerEvents, zIndex) {
        return $("<div>")
            .attr({
                id: name + "-container"
            })
            .css({
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                "pointer-events": pointerEvents ? "all" : "none",
                "z-index": zIndex
            })
    }


    /*** Helpers ***/

    function format(str, vals) {
        vals = $.isPlainObject(vals) ? vals : Array.prototype.slice.call($.isArray(vals) ? vals : arguments, 1);
        str = str.replace(/\{(\w+)\}/g, function (m, n) {
            var val = vals[n];
            if (val === null || val === undefined) return "";
            else return val;
        });
        return str;
    }

    function ensure() {
        $(arguments).each(function(arg) {
            if (arg === null || arg === undefined || arg === "") {
                console.log(arg);
                throw "Argument must exist";
            }
        });
    }

    function hideIcons(fade) {
        if (fade) {
            examineIcon.fadeOut();
            takeIcon.fadeOut();
        }
        else {
            examineIcon.hide();
            takeIcon.hide();
        }
    }

    function runLightning() {

        function setNormal() {
            contactContainer.css({
                opacity: ".7",
                "background": "#fff"
            });
        }

        function setLightning() {
            contactContainer.css({
                opacity: "",
                "background": "-webkit-gradient(radial, center center, 0, center center, 270, from(rgba(0,0,0,0)), to(rgba(0,0,0,1)))"
            });
        }

        setInterval(function() {
            setLightning();
            setTimeout(function() {
                setNormal();
                setTimeout(function() {
                    setLightning();
                    setTimeout(function() {
                        setNormal();
                        setTimeout(function() {
                            setLightning();
                            setTimeout(function() {
                                setNormal();
                            }, 200);
                        }, 100);
                    }, 100);
                }, 100);
            }, 100);
        }, 4000);

    }


    return game;

})();