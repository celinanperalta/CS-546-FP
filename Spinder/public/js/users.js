function spaces(x){
    let b=true;
    for (const n in x){
        b = b && x[n]===" ";
    }
    return b;
}

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
        if (!id)
            return;
        var requestConfig = {
            method: 'GET',
            url: '/profiles/' + id,
            headers: {
                'not-url': true
            },
            success: function (data) { },
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

    let curr_profile = getMusicalProfileAjax($('#curr_user_profile').attr('value'));
    let curr_user_liked = $('#curr_user_liked').attr('value');

    var $userList = $('#card-deck');
    var $users = $userList.children('.user');
    console.log($users.length);

    var sortList = Array.prototype.sort.bind($users);

    var sortUsers = function (type, ascending) {

        sortList(function (a, b) {

            // Cache inner content from the first element (a) and the next sibling (b)
            var aText;
            var bText;
            if (type === "name") {
                aText = $(a).find(".card-username").text();
                bText = $(b).find(".card-username").text();
            } else if (type === "match") {
                aText = $(a).find(".match-data").text();
                bText = $(b).find(".match-data").text();

                if (aText === "No Match Data")
                    aText = "";
                else 
                    aText = parseFloat(aText.replace("% Match", ""));
                
                if (bText === "No Match Data")
                    bText = "";
                else 
                    bText = parseFloat(bText.replace("% Match", ""))
            }
            
            if (aText < bText) {
                return ascending ? -1 : 1;
            }

            if (aText > bText) {
                return ascending ? 1 : -1;
            }

            // Returning 0 leaves them as-is
            return 0;
        });

        $userList.append($users);
    }


    $(document).ready(function () {
        $('#no-results-display').hide();
        $('#name-sort-asc').on('click', function (e) {
            console.log("name ascending");
            e.preventDefault();
            sortUsers("name", true);
        });

        $('#name-sort-dsc').on('click', function (e) {
            console.log("name descending");
            e.preventDefault();
            sortUsers("name", false);
        });

        $('#match-sort-asc').on('click', function (e) {
            console.log("match ascending");
            e.preventDefault();
            sortUsers("match", true);
        });

        $('#match-sort-dsc').on('click', function (e) {
            console.log("match descending");
            e.preventDefault();
            sortUsers("match", false);
        });


        $('.card').each(function (i, obj) {
            let user_id = $(this).find('.card-body').attr('id');
            let like_btn = $(this).find('.like_btn');
            let profile = $(this).find('.back');

            if (curr_profile && profile) {
                let response = getMusicalProfileAjax(profile.attr('id'));
                if (curr_profile && response && curr_profile.averageAudioFeatures && response.averageAudioFeatures) {
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
        
        $('#search').on('keyup', function(e){
            e.preventDefault;
            let search = $('#search').val();
            $('.card-username').each(function(){
                if(this.innerHTML.includes(search)){
                    $(`#${this.innerHTML}`).show();
                }
                else{
                    $(`#${this.innerHTML}`).hide();
                }
            });
            if ($(".user:hidden").length == $(".user").length)
                $('#no-results-display').show();
            else
                $('#no-results-display').hide();
        });

        $('#submit').click(function(e){
            e.preventDefault();
            let search= $('#search').val();
            let error=$('#error');
            error.empty();
            console.log(search);
            if(spaces(search) || search==''){
                console.log("in empty");
                error.empty();
                let errorMessage=$("<p>Please input a non-empty search term, thank you!</p>")
                error.append(errorMessage);
                error.show()
                $(".user").show();

            }
            else if(!$(`#${search}`).length){
                error.empty();
                let errorMessage=$("<p>No user found!</p>")
                error.append(errorMessage);
                error.show()
                $(".user").show();
             }
            else{
                //$(".user").not(userCard).hide();
                $(".user").hide();
                $(`#${search}`).show();
            }
        });
    });
})(window.jQuery);