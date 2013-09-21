
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
        icons,
        iconsTimer,
        display,
        displayTimer;

    // Values
    var values = {
        pointOffset: 10,
        imagePath:          "images/{name}.png",
        takeText:           "You have taken the {name}",
        panoZIndex: 1,
        areaZIndex: 2,
        itemZIndex: 3,
        lightZIndex: 4,
        displayZIndex: 5,
        contactZIndex: 6,
        verbs: ["examine", "take", "use", "talk"],
        millisecondPerChar: 520,
        iconImagePath:      "images/icons/{name}-orb.png",
        iconHideTime:       3000,
        iconOffsetTop: 85,
        iconZIndex: 7,
        iconPadding: 10,
        iconWidth: 60,
        iconHeight: 60
    };


    /*** Methods ***/

    game.say = function(text) {

        // Clear timeout
        clearTimeout(displayTimer);

        // Show text
        display.html(text);
        display.fadeIn();

        // Duration
        var duration = text.length * values.millisecondPerChar;

        // Hide on timer
        displayTimer = setTimeout(function() {
            display.fadeOut();
        }, duration);

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
        onObjPoint(params, img);

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
        onObjPoint(params, area);

    };


    /*** Events ***/

    function onBodyPoint(e) {

        // Show feedback
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

        // Hide display
        display.fadeOut();

        // Save state
        currentX = e.pageX;
        currentY = e.pageY;


    }

    function onObjPoint(params, obj) {

        currentObj = obj;

        obj.point(function() {

            // Display title
            game.say(params.title);

            // Init  icons
            var actionsExist;
            values.verbs.forEach(function(verb) {
                var val = params[verb];
                if (val) {
                    icons[verb]
                    .show()
                    .click(function() {
                        // Run action
                        actions["on" + toTitleCase(verb)](params, obj);
                        // Hide icons
                        hideIcons();
                    });
                    actionsExist = true;
                }
            });

            if (actionsExist) {

                // Show icons
                views[params.direction].append(icons);
                icons.css({
                    left: params.position[0] - (icons.width() / 2) + (obj.width() / 2),
                    top: params.position[1] - values.iconOffsetTop
                })
                .fadeIn();

                // Hide icons on timer
                clearTimeout(iconsTimer);
                iconsTimer = setTimeout(function() {
                    hideIcons();
                }, values.iconHideTime);

            }

        });

    }

    // Verb Actions
    var actions = {

        onExamine: function(params, obj) {
            game.say(params.examine);
        },

        onTake: function(params, obj) {
            obj.hide();
            game.say(format(values.takeText, { name: params.title }));
        },

        onUse: function(params, obj) {
            game.say(params.use);
        },

        onTalk: function(params, obj) {
            game.say(params.talk);
        }

    };


    /*** Init ***/

    function initEvents() {

        // Add point event
        $.fn.point = function(callback) {

            var startX, startY;

            $(this)
            .mousedown(function(e) {
                startX = e.pageX;
                startY = e.pageY;
            })
            .mouseup(function(e) {
                // TODO: Implement allowed offset
                var os = values.pointOffset;
                if (startX == e.pageX && startY == e.pageY) {
                    currentX = e.pageX;
                    currentY = e.pageY;
                    callback(e);
                }
                startX = null;
                startY = null;
            });

        };

    }

    function initUI() {

        // Body
        body = $("body");
        body.point(function(e) {
            onBodyPoint(e);
        });

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
        icons = getIconHTML();
        displayContainer.append(icons);
        values.verbs.forEach(function(verb) {
            icons[verb] = icons.find("[src*=" + verb + "]");
        });

    }

    $(function() {
        initEvents();
        initUI();
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

    function getIconHTML() {
        var table = $("<table><tr></tr></table>");
        table.css({
            position: "absolute"
        });
        values.verbs.forEach(function(verb) {
            table.find("tr").append(
                $("<td></td>")
                .append(
                    $("<img>")
                    .attr({
                        src: format(values.iconImagePath, { name: verb }),
                        title: toTitleCase(verb)
                    })
                    .css({
                        display: "none",
                        cursor: "pointer",
                        width: values.iconWidth,
                        height: values.iconHeight,
                        "z-index": values.iconZIndex,
                        "pointer-events": "all",
                        margin: values.iconPadding
                    })
                )
            )
        });
        return table;
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

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
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

        clearTimeout(iconsTimer);
        if (fade) {
            icons.fadeOut(function() {
                icons.find("img").hide();
            });
        }
        else {
            icons.hide();
            icons.find("img").hide();
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