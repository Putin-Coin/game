
$(function() {

    Game.setScene({
        "name": "LivingRoom",
        "items": [
            {
                name: "Vase",
                title: "Silver Vase",
                examine: "It's empty inside.  There doesn't appear to be anything special about it.",
                take: true,
                direction: "front",
                size: [50, 80],
                position: [580, 750]
            },
            {
                name: "Girl",
                title: "Female Ghost",
                direction: "back",
                size: [270, 600],
                position: [400, 550],
                opacity: .6
            }
        ],
        "areas": [
            {
                title: "A coffee table",
                coords: [341,909,476,769,774,778,891,935],
                direction: "front"
            }
        ]
    });

    setInterval(function() {
        $("center").hide();
    }, 1);


});