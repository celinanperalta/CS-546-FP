const axios = require("axios");
const BASE_URL = 'https://api.spotify.com/v1/search?';
const FETCH_URL = 'https://api.spotify.com/v1/artists/0OdUWJ0sBjDrqHygGUXeCF';


let exportedMethods = {
    async getSong() {
        accessToken = 'Bearer' + "??";

        axios.get(FETCH_URL, {headers : {'Authorization' : accessToken}})

        .then((response) => {
            console.log(response);
        })
            .catch((error) => {
                console.log(error);
        });
    }
}

module.exports = exportedMethods;

