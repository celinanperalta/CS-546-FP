(function ($) {

    function createChart(divName, profile) {
        data = [{
            type: 'scatterpolar',
            r: [profile.danceability, profile.energy, profile.loudness, profile.acousticness, profile.valence],
            theta: ['Danceability', 'Energy', 'Loudness', 'Acousticness', 'Valence'],
            fill: 'toself'
        }]

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
            url: '/profiles/' + id
        };

        $.ajax(requestConfig).then(function (response) {
            createChart(`${id}-chart`, response.averageAudioFeatures);
        });
    }

    $(document).ready(function () {
        $('.card-switch').find('.card-extension').hide();

        $('.card-switch').on({
            mouseenter: function (event) {
                let user = $(this).find('.card-main').attr('id');
                let profile = $(`#${user}-profile`).attr('href');
                console.log(getMusicalProfileAjax(profile));
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