console.log("hi");
$(document).ready(function() {
    (function($) {
        $('.userCard').hide();
        console.log("im in the ajax thing");
        let user;
        let hover = $('div.indUser');
        let hoverCard;
        console.log("HOVER: "+hover);
        $(hover).on({
            mouseenter: function(event) {
                event.preventDefault();
                user=event.target.id;
                hoverCard = $(`.${user}`);
                console.log(hoverCard);
                hoverCard.show();

            },
            mouseleave: function() {
                hoverCard.hide();
                console.log("leaving");
        }
});
    })(window.jQuery);
});