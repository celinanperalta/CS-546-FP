$(document).ready(function() {
    (function($) {
        $('.card-extension').hide();
        let user;
        let hoverCard;
         $('.indUser').on({
             mouseenter: function(event) {
                user=event.currentTarget.id;
                hoverCard = $(`#${user}-hide`);
                hoverCard.show();
             },
            mouseleave: function() {
                hoverCard.hide();
        }
    });
    })(window.jQuery);
});