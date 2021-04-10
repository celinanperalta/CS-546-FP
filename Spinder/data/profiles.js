const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const profiles = mongoCollections.profiles;
let { ObjectID } = require('mongodb');

let exportedMethods = {

    async getAllProfiles() {

    },

    async getProfileById(id) {

    },

    async addProfile(profile) {

    },

    async updateProfile(id) {

    },

    async removeProfile(id) {

    }

};

module.exports = exportedMethods;