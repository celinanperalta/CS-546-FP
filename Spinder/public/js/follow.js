(function ($) {

    function likeProfile(id) {
        var requestConfig = {
            method: 'POST',
            url: '/users/' + id + '/like',
        };

        $.ajax(requestConfig).then(function (response) {
            console.log("Liked " + id);
        });
    }

    function unlikeProfile(id) {
        var requestConfig = {
            method: 'POST',
            url: '/users/' + id + '/unlike',
        };

        $.ajax(requestConfig).then(function (response) {
            console.log("Unliked " + id);
        });
    }


    let curr_user_liked = $("#curr_user_liked").attr('value');;
    $(document).ready(function () {

        $('.list-group-item').each(function (i, obj) {
            let user_id = $(this).attr('id');
            let like_btn = $(this).find(`#like_btn${user_id}`);

            if (curr_user_liked.indexOf(user_id) != -1) {
                like_btn.text("favorite");
            } else {
                like_btn.text("favorite_border");
            }

            like_btn.on('click', function (e) {
                e.preventDefault();
                console.log(like_btn.html());
                if (like_btn.text() == "favorite") {
                    like_btn.text("favorite_border");
                    unlikeProfile(user_id);
                } else {
                    like_btn.text("favorite");
                    likeProfile(user_id);
                }
            });

        });

    });
})(window.jQuery);