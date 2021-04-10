const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const users = mongoCollections.users;
let { ObjectID } = require('mongodb');

let exportedMethods = {

    async getAllUsers() {

    },

    async getUserById(id) {

    },

    async addUser(user) {

    },

    async updateUser(id) {

    },

    async removeUser(id) {

    }

};

module.exports = exportedMethods;