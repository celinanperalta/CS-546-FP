const BASE_URL = "http://api.tvmaze.com/";
const axios = require('axios');
const request = require('request');
const artistData = require('./artists');
const songData = require('./songs');
const bcrypt = require('bcrypt');
const config = require('../config/spotify_config.json');
const spotifyConfig = config.spotifyConfig;

const data_limit = 20;

let exportedMethods = {

    async sendWebAPIRequest(token, endpoint, params) {
        try {
            let res = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res) {
                throw Error("Could not fetch data.");
            }

            return res.data;
        } catch (e) {
            // access token probably expired
            if (res.status == 401) {
                throw Error("401");
            }
            console.log(e);
        }
    },

    async getUserTopArtists(user_id, token) {
        // TODO: Validate user
        let endpoint = "me/top/artists/";
        let data = undefined;

        try {
            data = await this.sendWebAPIRequest(token, endpoint);
        } catch(e) {
            if (e.message == "401" ) {
                throw Error("Refresh token");
            } else {
                throw Error(e.message);
            }
        }

        const artists = data.items || []; //array of artist objects
        let artist_arr = [];

        for (let i = 0; i != 5 && i != artists.length; ++i) {

            let currArtist = {
                user_ids: [],
                spotify_id: artists[i].id,
                spotify_url: artists[i].href,
                name: artists[i].name,
                img: artists[i].images[0].url
            };

            try {
                const artist = await artistData.getArtistById(artists[i].id); //instead just add the user_id to the user_ids array
                let user_id_arr = artist.user_ids; //get the old user_ids array
                user_id_arr.push(user_id); //add the new user to this array
                currArtist.user_ids = user_id_arr;
                try {
                    let updatedArtist = await artistData.updateArtist(artist._id, currArtist);
                    artist_arr.push(updatedArtist._id);
                } catch (e) {
                    //artist was unable to be updated
                    console.log(e);
                }
            } catch (e) {
                //artist was unable to be updated
                currArtist.user_ids = [user_id];
                try {
                    let newArtist = await artistData.addArtist(currArtist);
                    artist_arr.push(newArtist);
                } catch (e) {
                    //artist was unable to be added
                    console.log(e);
                }
            }
        }

        return artist_arr; //return full top artists array
    },

    async getUserTopSongs(user_id, token) {
        let endpoint = "me/top/tracks/";
        let data = undefined;

        try {
            data = await this.sendWebAPIRequest(token, endpoint);
        } catch(e) {
            if (e.message == "401" ) {
                throw Error("Refresh token");
            } else {
                throw Error(e.message);
            }
        }

        const songs = data.items || []; //array of artist objects
        let songs_arr = [];

        for (let i = 0; i != songs.length && i != 10; ++i) {
            let currSong = {
                  user_ids : [],
                  spotify_id: songs[i].id,
                  spotify_url: songs[i].url,
                  name: songs[i].name,
                  album_name: songs[i].album.name,
                  artists: Array.map((x) => x.name, songs[i].artists),
                  img: songs[i].album.images[0].url,
                  audio_features: {}
              };

            //   TODO: get audio features then do the thing
        }

        return songs; //return full top artists array
    },

    async getUserPlaylists(user_id) {

    }

}

module.exports.spotifyData = exportedMethods;
module.exports = exportedMethods;