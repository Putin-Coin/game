
Pano = (function() {

    /*** State ***/

    var pano = {},
        initialized = false,
        viewer = null;

    var values = {
        imagePath: "scenes/{name}/view-%s.jpg",
        blankImagePath: "images/blank.png",
        hotspotImagePath: "images/blank-1000.png",
        panoId: "pano-viewer",
        panoTargetId: "pano-container",
        viewHotspotSelector:"#pano-container div[style*='image']",
        directions: ["front", "back", "left", "right", "up", "down"],
        directionChars: ["f", "b", "l", "r", "u", "d"]
    };


    /*** Methods ***/

    // params: name
    pano.load = function(params, callback) {

        // Clear cache
        Pano.views = {};

        // Initialize
        if (!initialized) {
            krpanojs_init({
                id: values.panoId,
                target: values.panoTargetId,
                html5:"only",
                onready: function(krpano) {
                    viewer = krpano;
                    initialized = true;
                    loadPano();
                }
            });
        }
        else {
            loadPano();
        }

        // Load pano
        function loadPano() {

            // Run callback when loaded
            Pano.onLoadComplete = function() {

                pano.views = {};
                var views = $(values.viewHotspotSelector);

                // Setup views
                values.directions.forEach(function(direction, index) {

                    var view = $(views[index]);

                    // Cache view
                    // Ex: Pano.views.front.append(...);
                    pano.views[direction] = view;

                    // Add image map
                    var image = getAreaImageHTML(direction),
                        imageMap = getImageMapHTML(direction);
                    view.append(image).append(imageMap);
                    view.imageMap = imageMap;

                });

                // Run passed callback
                callback();

                // Delete this temp function
                delete Pano.onLoadComplete;

            };

            // Load pano via XML string
            // This is the only way apparently
            viewer.call("loadxml(" + getPanoXML(params) + ")");

        }

    };


    /*** HTML/XML ***/

    function getAreaImageHTML(direction) {
        return $("img")
            .attr({
                src: values.blankImagePath,
                usemap: "#image-map-" + direction
            })
            .css({
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%"
            })
    }

    function getImageMapHTML(direction) {
        return $("map").attr({
            name: "image-map-" + direction
        })
    }

    function getPanoXML(params) {

        var imagePath = format(values.imagePath, params);

        // Create hotspot XML for each direction
        var hotspots = "";
        values.directionChars.forEach(function(direction) {
            hotspots += format(
                "<hotspot name='view-{direction}' url='{imagePath}' distorted='true' {coords} " +
                    "width='1000' height='1000' edge='lefttop' ox='-500' oy='-500' alpha='1.0' " +
                    "capture='false' handcursor='false' zorder='1' />",
                {
                    direction: direction,
                    imagePath: values.hotspotImagePath,
                    coords: getCoordsString(direction)
                }
            )
        });

        // Create XML
        var panoXml = format(
            "<krpano>" +
                "<image><cube url='{imagePath}' /></image>" +
                "<view hlookat='7' vlookat='5' fovtype='MFOV' fov='100' fovmin='30' fovmax='120' />" +
                "<events onloadcomplete='js(Pano.onLoadComplete())' />" +
                "{hotspots}" +
            "</krpano>",
            {
                imagePath: imagePath,
                hotspots: hotspots
            }
        );

        return panoXml;

    }

    function getCoordsString(direction) {
        return {
            f: "ath='0' atv='0'",
            b: "ath='180' atv='0'",
            l: "ath='-90' atv='0'",
            r: "ath='90' atv='0'",
            u: "ath='0' atv='-90'",
            d: "ath='0' atv='90'"
        }[direction];
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


    return pano;

})();