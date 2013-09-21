
$(function() {

    Game.setScene({
        name: "living-room",
        items: [
            {
                name: "vase",
                title: "Silver Vase",
                examine: "It's empty inside.  There doesn't appear to be anything special about it.",
                use: "You can't do that right now.",
                take: true,
                direction: "front",
                size: [50, 80],
                position: [500, 630]
            },
            {
                name: "girl",
                title: "Female Ghost",
                examine: "The clear your eys.  Are you seeing this for real?  It appears to be an actual ghost.  It looks like a you girl in her 30's.",
                talk: "Hello stranger, my name Miranda. Why are you here?",
                direction: "back",
                size: [270, 600],
                position: [400, 450],
                opacity: .6
            }
        ],
        areas: [
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