const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const songs = mongoCollections.songs;
let { ObjectID } = require('mongodb');

let exportedMethods = {

    async getAllSongs() {
        const songsCollection = await songs();//Obtain song collection
        const songsList = await songsCollection.find();//get all songs
        return songsList;
    },

    async getSongById(id) {
        if(!id || typeof id !== 'string'|| id == ""){//Check that id exists and is of correct type
            throw new Error("Must provide valid string id");
        }
        const songsCollection = await songs();//Obtain song collection
        const song = await songsCollection.findOne({ _id: ObjectID.ObjectID(id)});//get song by id
        if(song === null){//if no song found throw an error
            throw new Error("Song not found with that id");
        }
        song._id = song._id.toString();
        return song;
    },

    async getSongBySpotifyId(id) {
        if(!id || typeof id !== 'string'|| id == ""){//Check that id exists and is of correct type
            throw new Error("Must provide valid string id");
        }
        const songsCollection = await songs();//Obtain song collection
        const song = await songsCollection.findOne({ spotify_id: id});//get song by id
        if(song === null){//if no song found throw an error
            throw new Error("Song not found with that id");
        }
        song._id = song._id.toString();
        return song;
    },

    async addSong(song) {
        const result = schemas.songSchema.validate(song);
        if(result.error){//if not a valid song throw an error
            throw new Error(result.error);
        }
        const songsCollection = await songs();
        let newSong = {
            _id: song._id,
            user_ids: song.user_ids,
            spotify_id: song.spotify_id,
            spotify_url: song.spotify_url,
            name: song.name,
            album_name: song.album_name,
            artists: song.artists,
            img: song.img,
            audio_features: song.audio_features
        }
        const insertInfo = await songsCollection.insertOne(newSong);
        if(insertInfo.insertedCount ===0){
            throw new Error("Insert failed.");
        }
        newSong._id = newSong._id.toString();
        return newSong;
    },

    async updateSong(id,updatedSong) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const result = schemas.songSchema.validate(updatedSong);
        if(result.error){
            throw new Error(result.error);
        }
        const songsCollection = await songs();
        const updatedSongData = {};
        //Check for what fields are being updated
        if(updatedSong.user_ids){
            updatedSongData.user_ids = updatedSong.user_ids;
        }
        if(updatedSong.spotify_id){
            updatedSongData.spotify_id = updatedSong.spotify_id;
        }
        if(updatedSong.spotify_url){
            updatedSongData.spotify_url = updatedSong.spotify_url;
        }
        if(updatedSong.name){
            updatedSongData.name = updatedSong.name;
        }
        if(updatedSong.album_name){
            updatedSongData.album_name = updatedSong.album_name;
        }
        if(updatedSong.artists){
            updatedSongData.artists = updatedSong.artists;
        }
        if(updatedSong.img){
            updatedSongData.img = updatedSong.img;
        }
        if(updatedSong.audio_features){
            updatedSongData.audio_features = updatedSong.audio_features;
        }

        //Update in the DB
        await songsCollection.updateOne({_id: ObjectID.ObjectId(id)},{$set: updatedSongData});
        return await this.getSongById(id);

    },

    async removeSong(id) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const songsCollection = await songs();
        const song = await this.getSongById(id);
        //Delete from DB
        const deletionInfo = await songsCollection.deleteOne({_id: ObjectID.ObjectId(id)});
        if(deletionInfo.deletedCount ===0){
            throw new Error(`Could not delete song with id of ${id}`);
        }
        return song;
    },

    async removeUserFromSongs(id) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const songsCollection = await songs(); 
        const deleteInfo = await songsCollection.updateMany(
            { },
            { $pull: {user_ids: `${id}`}},
            { multi: true}
        );
        return deleteInfo;
    }

};

module.exports = exportedMethods;