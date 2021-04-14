const BASE_URL = "http://api.tvmaze.com/";
const axios = require('axios');
const request = require('request');
const userData = require('./users');
const artistData = require('./artists');
const songData = require('./songs');

const data_limit = 20;

let exportedMethods = {

    async sendWebAPIRequest(token, endpoint) {
        const apiData = await request({
            method: 'GET',
            uri: `https://api.spotify.com/v1/${endpoint}`,
            headers: {
              Authorization: `Bearer ${token}`
            },
            json: true
          });

        const data = (data && data.items) || [];

        return data;
    },

    async getUserTopArtists(user_id) {
        // TODO: Validate user
        let endpoint = "me/top/artists/";
        let token = "";

        const data = await this.sendWebAPIRequest(token, endpoint);
    },

    async getUserTopSongs(user_id) {
        let endpoint = "me/top/tracks/";

        const data = await this.sendWebAPIRequest(token, endpoint);
    },

    async getUserPlaylists(user_id) {

    }

}

module.exports = exportedMethods;