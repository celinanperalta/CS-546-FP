(function ($) {

    function createChart(divName, profile, profile2) {
        data = [{
            type: 'scatterpolar',
            r: [profile.danceability, profile.energy, profile.loudness, profile.acousticness, profile.valence],
            theta: ['Danceability', 'Energy', 'Loudness', 'Acousticness', 'Valence'],
            fill: 'toself',
            name: 'Them'
        },
        {
            type: 'scatterpolar',
            r: [profile2.danceability, profile2.energy, profile2.loudness, profile2.acousticness, profile2.valence],
            theta: ['Danceability', 'Energy', 'Loudness', 'Acousticness', 'Valence'],
            fill: 'toself',
            name: 'You'
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
            valign: "top"
        }

        var config = {
            responsive: true,
            displayModeBar: false
        }

        Plotly.newPlot(divName, data, layout, config);
    }

    function getMusicalProfileAjax(id) {
        var requestConfig = {
            method: 'GET',
            url: '/profiles/' + id,
            success: function (data) {},
            async: false,
            error: function (err) {
                console.log(err);
            }
        };

        var response = $.ajax(requestConfig).responseText;
        console.log(response);
        return response;
        
    }

    $(document).ready(function () {
        let curr_profile = getMusicalProfileAjax($('#curr_user_profile').attr('value'));
        console.log("AA");
        console.log(curr_profile);
        $('.card-switch').find('.card-extension').hide();

        $('.card-switch').on({
            mouseenter: function (event) {
                let user = $(this).find('.card-main').attr('id');
                let profile = $(`#${user}-profile`).attr('href');
                let response = getMusicalProfileAjax(profile);
                if (response)
                    createChart(`${user}-chart`, response.averageAudioFeatures, curr_profile.averageAudioFeatures);
                $(this).find('.card-main').hide();
                $(this).find('.card-extension').show();
            },
            mouseleave: function () {
                $(this).find('.card-extension').hide();
                $(this).find('.card-main').show();
            }
        });

    });
})(window.jQuery);