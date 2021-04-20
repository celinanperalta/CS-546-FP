const BASE_URL = "http://api.tvmaze.com/";
const axios = require('axios');
const request = require('request');
const artistData = require('./artists');
const songData = require('./songs');
const bcrypt = require('bcrypt');

const data_limit = 20;

let exportedMethods = {

    async sendWebAPIRequest(token, endpoint, params={}) {


        let res = await axios.get(`https://api.spotify.com/v1/${endpoint}`, 
        {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            params: params
        });

        if (!res) {
            throw Error("Could not fetch data.");
        }

        return res.data;
    },
    
    async getUserTopArtists(user_id, token) {
        // TODO: Validate user
        let endpoint = "me/top/artists/";
        const data = await this.sendWebAPIRequest(token, endpoint, {limit: 5});

        const artists = data.items || []; //array of artist objects

        for (let i = 0; i != artists.length; ++i) {
            try {
                const artist = await artistData.getArtistById(artists[i].id); //instead just add the user_id to the user_ids array
                let user_id_arr = artist.user_ids; //get the old user_ids array
                user_id_arr.push(user_id); //add the new user to this array
                let updatedArtist = {
                    user_ids: user_id_arr,
                    spotify_id: artists[i].id,
                    spotify_url: artists[i].href,
                    name: artists[i].name,
                    img: artists[i].images[0]
                }
                try {
                    await artistData.updateArtist(artist._id, updatedArtist);
                } catch (e) {
                    //artist was unable to be updated
                    console.log(e);
                }
            } catch (e) {
                //artist was unable to be updated
                let artist = {
                    _id: artists[i].id,
                    user_ids: user_id_arr,
                    spotify_id: artists[i].id,
                    spotify_url: artists[i].href,
                    name: artists[i].name,
                    img: artists[i].images[0]
                }
                try {
                    await artistData.addArtist(artist);
                } catch (e) {
                    //artist was unable to be added
                    console.log(e);
                }
            }
        }

        return artists; //return full top artists array
    },

    async getUserTopSongs(user_id, token) {
        let endpoint = "me/top/tracks/";
        const data = await this.sendWebAPIRequest(token, endpoint, {limit: 10});

        const songs = data.items || []; //array of artist objects
        return songs; //return full top artists array
    },

    async getUserPlaylists(user_id) {

    }

}

module.exports.spotifyData = exportedMethods;
module.exports = exportedMethods;