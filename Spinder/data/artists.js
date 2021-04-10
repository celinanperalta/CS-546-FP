const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const artists = mongoCollections.artists;
let { ObjectID } = require('mongodb');

let exportedMethods = {

    async getAllArtists() {

    },

    async getArtistById(id) {

    },

    async addArtist(artist) {

    },

    async updateArtist(id) {

    },

    async removeArtist(id) {

    }

};

module.exports = exportedMethods;