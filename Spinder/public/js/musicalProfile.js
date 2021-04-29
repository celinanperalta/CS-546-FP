function createChart(divName, profile) {
    console.log(typeof profile);
    console.log(profile);
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
    showlegend: false
}

Plotly.newPlot(divName, data, layout);
}

(function() {
    let profile = {
        danceability: document.getElementById("danceability"),
        energy: document.getElementById("energy"),
        loudness: document.getElementById("loudness"),
        acousticness: document.getElementById("acousticness"),
        valence: document.getElementById("valence")
    };

    console.log(profile);

    for (let [key, value] of Object.entries(profile)) {
        console.log(value);
        profile[key] = parseFloat(value.value);
    }

    createChart("radarChart", profile);
})();