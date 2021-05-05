const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const profiles = mongoCollections.profiles;
let { ObjectID } = require('mongodb');

let exportedMethods = {

    async getAllProfiles() {
        const profilesCollection = await profiles();//Obtain profiles colllection
        const profilesList = await profilesCollection.find();//Get all profiles
        return profilesList;
    },

    async getProfileById(id) {
        if(!id || typeof id !== 'string'|| id == ""){//Check that id exists and is of correct type
            throw new Error("Must provide valid string id");
        }
        const profilesCollection = await profiles();//Obtain profiles colllection
        const profile = await profilesCollection.findOne({ _id: ObjectID.ObjectID(id)});//get profile by id
        if(profile === null){
            throw new Error("Profile not found with that id.");
        }
        profile._id = profile._id.toString();
        return profile;
    },

    async addProfile(profile) {
        const result = schemas.profileSchema.validate(profile);
        if(result.errors){
            throw new Error(result.error);
        }
        const profilesCollection = await profiles();//Obtain profile collection
        let newProfile = {//build profile to be added.
            _id: profile._id,
            user_id: profile.user_id,
            topGenres: profile.topGenres,
            averageAudioFeatures: profile.averageAudioFeatures
        }

        const insertInfo = await profilesCollection.insertOne(newProfile);
        if(insertInfo.insertedCount ===0){//Check if insert failed
            throw new Error("Insert failed");
        }
        newProfile._id = newProfile._id.toString();
        return newProfile;

    },

    async updateProfile(id,updatedProfile) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const result = schemas.profileSchema.validate(updatedProfile);
        if(result.error){
            throw new Error(result.error);
        }
        const profilesCollection = await profiles();//Obtain profile collection
        const updatedProfileData = {};
        //Check what fieds are being updated
        if(updatedProfile.user_id){
            updatedProfileData.user_id = updatedProfile.user_id;
        }
        if(updatedProfile.topGenres){
            updatedProfileData.topGenres = updatedProfile.topGenres;
        }
        if(updatedProfile.averageAudioFeatures){
            updatedProfileData.averageAudioFeatures = updatedProfile.averageAudioFeatures;
        }

        //Updated in the Db
        await profilesCollection.updateOne({_id: ObjectID.ObjectId(id)},{$set: updatedProfileData});
        return await this.getProfileById(id);
    },

    async removeProfile(id) {
        if(!id || typeof id !== 'string' || id == ""){
            throw new Error("Must provide valid string id");
        }
        const profilesCollection = await profiles();
        const profile = this.getProfileById(id);
        //Delete from DB
        const deletionInfo = await profilesCollection.deleteOne({_id: ObjectID.ObjectId(id)});
        if(deletionInfo.deletedCount ===0){
            throw new Error(`Could not delete profile with id of ${id}`);
        }
        return profile;
    }

};

module.exports = exportedMethods;