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
        $('.card-extension').hide();
        let user;
        let hoverCard;

        $('.indUser').on({
            mouseenter: function (event) {
                event.preventDefault();
                user = event.currentTarget.id;
                let profile = $(`#${user}-profile`).attr('href');
                console.log(getMusicalProfileAjax(profile));
                hoverCard = $(`#${user}-hide`);
                hoverCard.show();
            },
            mouseleave: function () {
                event.preventDefault();
                hoverCard.hide();
            }
        });
    });
})(window.jQuery);