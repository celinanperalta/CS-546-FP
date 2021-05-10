(function ($) {

    function createChart(divName, profile, profile2) {
        data = [{
                type: 'scatterpolar',
                r: [profile.danceability, profile.energy, profile.loudness, profile.acousticness, profile.valence],
                theta: ['Danceability', 'Energy', 'Loudness', 'Acousticness', 'Valence'],
                fill: 'toself',
                name: 'You'
            },
            {
                type: 'scatterpolar',
                r: [profile2.danceability, profile2.energy, profile2.loudness, profile2.acousticness, profile2.valence],
                theta: ['Danceability', 'Energy', 'Loudness', 'Acousticness', 'Valence'],
                fill: 'toself',
                name: 'Them'
            }
        ]

        layout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 1]
                }
            },
            showlegend: false,
            margin: {
                l: 0,
                r: 0,
                t: 0,
                b: 0
            }
        }

        var config = {
            responsive: true,
            displayModeBar: false
        }

        Plotly.newPlot(divName, data, layout, config);
    }

    function getMatchPercent(id, profile, profile2) {
        let arr1 = [profile.danceability, profile.energy, profile.loudness, profile.acousticness, profile.valence];
        let arr2 = [profile2.danceability, profile2.energy, profile2.loudness, profile2.acousticness, profile2.valence];

        let sum = 0;
        for (let i = 0; i < arr1.length; i++) {
            sum += Math.abs(arr1[i] - arr2[i]);
        }

        sum = (1 - (sum / 5.0)) * 100;
        sum = sum.toFixed(1);

        $(`#${id}-match`).find(".card-title").text(`${sum}% Match`);

    }

    function getMusicalProfileAjax(id) {
        var requestConfig = {
            method: 'GET',
            url: '/profiles/' + id,
            success: function (data) {},
            async: false,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: function (err) {
                console.log(err);
            }
        };

        var response = $.ajax(requestConfig).responseText;
        return JSON.parse(response);

    }

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

    $(document).ready(function () {
        let curr_profile = getMusicalProfileAjax($('#curr_user_profile').attr('value'));
        let curr_user_liked = $('#curr_user_liked').attr('value');

        $('.card-switch').each(function (i, obj) {
            let user_id = $(this).find('.card-body').attr('id');
            let like_btn = $(this).find('#like_btn');
            let profile = $(`#${user_id}-chart`).attr('href');

            if (profile) {
                let response = getMusicalProfileAjax(profile);
                if (response) {
                    createChart(`${user_id}-chart`, curr_profile.averageAudioFeatures, response.averageAudioFeatures);
                    getMatchPercent(user_id, curr_profile.averageAudioFeatures, response.averageAudioFeatures);
                    $(this).find('.flip').flip({
                        trigger: 'hover'
                    });
                }
            }

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