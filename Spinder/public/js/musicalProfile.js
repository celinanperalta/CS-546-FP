function createChart(divName, profile) {
    data = [{
    type: 'scatterpolar',
    r: [profile.danceability, profile.energy, profile.loudness, profile.acousticness, profile.valence],
    theta: ['Danceability','Energy','Loudness', 'Acousticness', 'Valence'],
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

(function() {
    let profile = {
        danceability: document.getElementById("danceability"),
        energy: document.getElementById("energy"),
        loudness: document.getElementById("loudness"),
        acousticness: document.getElementById("acousticness"),
        valence: document.getElementById("valence")
    };


    for (let [key, value] of Object.entries(profile)) {
        profile[key] = parseFloat(value.value);
    }

    createChart("radarChart", profile);
})();