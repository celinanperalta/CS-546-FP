const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const users = mongoCollections.users;
let { ObjectID } = require('mongodb');
const { songs } = require('../config/mongoCollections');
const spotifyData = require('./spotify');

let exportedMethods = {

    async getAllUsers() {
        const usersCollection = await users();//Obtain user collection
        const usersList = await usersCollection.find({});//get all users
        return usersList;
    },

    async getUserById(id) {
        if(!id || typeof id !== 'string'|| id == ""){//Check that id exists and is of correct type
            throw new Error("Must provide valid string id");
        }
        const usersCollection = await users();//obtain users collection
        const user = await usersCollection.findOne({ _id: ObjectID.ObjectID(id)});
        if(user === null){
            throw new Error("User not found with that id");
        }
        user._id = user._id.toString();
        return user;
    },

    async getUserBySpotifyUsername(username) {
        if(!username || typeof username !== 'string'|| username == ""){//Check that id exists and is of correct type
            throw new Error("Must provide valid string username");
        }
        const usersCollection = await users();//obtain users collection
        const user = await usersCollection.findOne({ username: username});
        if(user === null){
            throw new Error("User not found with username " + username);
        }
        console.log(user);
        user._id = user._id.toString();
        return user;
    },

    // This should only be called when a new user logs in!
    async addUser(user) {
        const result = schemas.userSchema.validate(user);
        if (result.error) {//if not valid user, throw an error
            throw new Error(result.error);
        }
        const usersCollection = await users();
        let newUser = result.value;

        const insertInfo = await usersCollection.insertOne(newUser);
        if(insertInfo.insertedCount === 0) {
            throw new Error("Insert failed");
        }

        newUser._id = newUser._id.toString();
        // TODO: Get top artists and songs for user and populate fields
        console.log("Getting user artists...");
        let topArtistsData = await spotifyData.getUserTopArtists(newUser.access_token);
        console.log(topArtistsData);

        // TODO: After getting top songs, create musical profile object
        
        return newUser;
    },

    async updateUser(id, updatedUser) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const result = schemas.userSchema.validate(updatedUser);
        if(result.error){
            throw new Error(result.error);
        }
        const usersCollections = await users();
        const updatedUserData = {};
        //Check for what fields are being updated
        if(updatedUser.firstName){
            updatedUserData.firstName = updatedUser.firstName;
        }
        if(updatedUser.lastName){
            updatedUserData.lastName = updatedUser.lastName;
        }
        if(updatedUser.username){
            updatedUserData.username = updatedUser.username;
        }
        if(updatedUser.email){
            updatedUserData.email = updatedUser.email;
        }
        if(updatedUser.location){
            updatedUserData.location = updatedUser.location;
        }
        if(updatedUser.img){
            updatedUserData.img = updatedUser.img;
        }
        if(updatedUser.topArtist){
            updatedUserData.topArtist = updatedUser.topArtist;
        }
        if(updatedUser.topSongs){
            updatedUserData.topSongs = updatedUser.topSongs;
        }
        if(updatedUser.playlists){
            updatedUserData.playlists = updatedUser.playlists;
        }
        if(updatedUser.likedProfiles){
            updatedUserData.likedProfiles = updatedUser.likedProfiles;
        }
        if(updatedUser.musicalProfile){
            updatedUserData.musicalProfile = updatedUser.musicalProfile;
        }

        //Updated in the DB
        await usersCollections.updatedOne({_id: ObjectID.ObjectId(id)},{$set: updatedUserData});
        return await this.getUserById(id);

    },

    async removeUser(id) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const usersCollection = await users();
        const user = await this.getUserById(id);
        //Delete from db
        const deletionInfo = await usersCollection.deleteOne({_id: ObjectID.ObjectId(id)});
        if(deletionInfo.deletedCount ===0){
            throw new Error(`Could not delete user with id of ${id}`);
        }
        return user;
    }

};

module.exports = exportedMethods;