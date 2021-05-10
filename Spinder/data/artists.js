const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const artists = mongoCollections.artists;
const userData = require('./users');
let { ObjectID } = require('mongodb');
let exportedMethods = {

    async getAllArtists() {
        const artistsCollection = await artists();//obtain artist collection
        const artistsList = await artistsCollection.find();//get list of artist objects
        return artistsList;
    },

    async getArtistById(id) {
        if(!id || typeof id !== 'string'|| id == ""){//Check that id exists and is of correct type
            throw new Error("Must provide valid string id");
        }
        const artistsCollection = await artists();//obtain artist collection
        const artist = await artistsCollection.findOne({ _id: ObjectID.ObjectID(id)});//find artist with ID
        if(artist === null){//if not found then throw error
            throw new Error("Artist not found with that id");
        }
        artist._id = artist._id.toString();
        return artist;
    },

    async getArtistBySpotifyId(id) {
        if(!id || typeof id !== 'string'|| id == ""){//Check that id exists and is of correct type
            throw new Error("Must provide valid string id");
        }
        const artistsCollection = await artists();//obtain artist collection
        const artist = await artistsCollection.findOne({ spotify_id: id});//find artist with ID
        if(artist === null){//if not found then throw error
            throw new Error("Artist not found with that id");
        }
        artist._id = artist._id.toString();
        return artist;
    },

    async addArtist(artist) {
        const result = schemas.artistSchema.validate(artist);//validate artist
        if(result.error){//throw if error
            throw new Error(result.error);
        }
        const artistsCollection = await artists();
        let newArtist = result.value;

        const insertInfo = await artistsCollection.insertOne(newArtist);
        if(insertInfo.insertedCount === 0){
            throw new Error("Insert failed.");
        }
        newArtist._id = newArtist._id.toString();

        return newArtist;
    },

    async addArtistToUser(aritist_id, user_id) {
        return -1;
    },

    async updateArtist(id, updatedArtist) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const result = schemas.artistSchema.validate(updatedArtist);//validate artist
        
        if(result.error){//throw if error
            throw new Error(result.error);
        }
        const artistsCollection = await artists();
        const updatedArtistData = result.value;
        //Check for what fields are being updated
        if(updatedArtist.user_ids){
            updatedArtistData.user_ids = updatedArtist.user_ids;
        }
        if(updatedArtist.spotify_id){
            updatedArtistData.spotify_id = updatedArtist.spotify_id;
        }
        if(updatedArtist.spotify_url){
            updatedArtistData.spotify_url = updatedArtist.spotify_url;
        }
        if(updatedArtist.name){
            updatedArtistData.name = updatedArtist.name;
        }
        if(updatedArtist.img){
            updatedArtistData.img = updatedArtist.img;
        }
        if(updatedArtist.genres){
            updatedArtistData.genres = updatedArtist.genres;
        }

        //Update in the DB
        await artistsCollection.updateOne({_id: ObjectID.ObjectId(id)}, {$set: updatedArtistData});
        return await this.getArtistById(id);
    },

    async removeArtist(id) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const artistsCollection = await artists(); 
        const artist = await this.getArtistById(id);
        //Delete from DB
        const deletionInfo = await artistsCollection.deleteOne({_id: ObjectID.ObjectId(id)})
        if (deletionInfo.deletedCount === 0) {
            throw new Error(`Could not delete artist with id of ${id}`);
        }
        return artist;
    },

    async removeUserFromArtists(id) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const artistsCollection = await artists(); 
        const deleteInfo = await artistsCollection.update(
            { },
            { $pull: {user_ids: `${id}`}},
            { multi: true}
        );
        if (deletionInfo.deletedCount === 0) {
            throw new Error(`Could not delete user with id: ${id}, from artists.`);
        }
        return deleteInfo;
    }

};

module.exports = exportedMethods;