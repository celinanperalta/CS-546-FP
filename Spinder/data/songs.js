const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const songs = mongoCollections.songs;
let { ObjectID } = require('mongodb');

let exportedMethods = {

    async getAllSongs() {

    },

    async getSongById(id) {

    },

    async addSong(song) {

    },

    async updateSong(id) {

    },

    async removeSong(id) {

    }

};

module.exports = exportedMethods;