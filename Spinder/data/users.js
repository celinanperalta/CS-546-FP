const mongoCollections = require('../config/mongoCollections');
const schemas = require('./schemas');
const users = mongoCollections.users;
const songs = mongoCollections.songs;
const artists = mongoCollections.artists;
let {
    ObjectID
} = require('mongodb');
const config = require('../config/spotify_config.json');
const spotifyConfig = config.spotifyConfig;
const request = require('request');
const spotifyData = require('./spotify');
const profileData = require('./profiles');
//const songData = require('./songs');

function parseId(id) {
    try {
        ObjectID(id);
        return true;
    } catch (e) {
        return false;
    }
}

let exportedMethods = {


    async getAllUsers() {
        const usersCollection = await users(); //Obtain user collection
        const usersList = await usersCollection.find({}).toArray(); //get all users

        // usersList.map((d) => {
        //     d._id = d._id.toString();
        // });

        return usersList;
    },

    async getUserById(id) {
        if (!id || typeof id !== 'string' || id == "") { //Check that id exists and is of correct type
            throw new Error("Must provide valid string id");
        }
        const usersCollection = await users(); //obtain users collection
        if (!parseId(id)) {
            throw new Error("Uh Oh, Page Not Found!");
        }
        const user = await usersCollection.findOne({
            _id: ObjectID.ObjectID(id)
        });
        if (user === null) {
            throw new Error("Uh Oh, No User Found :(");
        }
        user._id = user._id.toString();
        return user;
    },

    async getUserByUsername(username) {
        if (!username || typeof username !== 'string' || username == "") { //Check that id exists and is of correct type
            throw new Error("Must provide valid string username");
        }
        const usersCollection = await users(); //obtain users collection
        const user = await usersCollection.findOne({
            username: username
        });
        if (user === null) {
            throw new Error("User not found with username " + username);
        }
        user._id = user._id.toString();
        return user;
    },

    // same as last but with true / false
    async checkExistence(username) {
        if (!username || typeof username !== 'string' || username == "") { //Check that id exists and is of correct type
            throw new Error("Must provide valid string username");
        }
        const usersCollection = await users(); //obtain users collection
        const user = await usersCollection.findOne({
            username: username
        });
        if (!user) {
            return false;
        } else {
            return true;
        }
    },

    // This should only be called when a new user registers!
    async addUser(user) {
        const result = schemas.newUserSchema.validate(user);
        if (result.error) { //if not valid user, throw an error
            throw new Error(result.error);
        }
        const usersCollection = await users();
        let newUser = result.value;

        const insertInfo = await usersCollection.insertOne(newUser);
        if (insertInfo.insertedCount === 0) {
            throw new Error("Insert failed");
        }

        newUser._id = newUser._id.toString();

        let insertedUser = await this.getUserById(newUser._id);
        return insertedUser;
    },

    async loadUserSpotifyData(user_id) {
        let user = await this.getUserById(user_id);


        await this.refreshAuthToken(user_id);
        // TODO: Get top artists and songs for user and populate fields
        // console.log("Getting user artists...");
        // let topArtistsData = await spotifyData.getUserTopArtists(newUser.access_token);
        // console.log(topArtistsData);
        await this.loadUserTopArtists(user_id);
        // TODO: After getting top songs, create musical profile object
        await this.loadUserTopSongs(user_id);

        await this.loadUserMusicProfile(user_id);

        let insertedUser = await this.getUserById(user_id);
        return insertedUser;
    },

    async updateUser(id, updatedUser) {
        if (!id || typeof id !== 'string' || id == "") {
            throw new Error("Must provide valid string id");
        }
        const result = schemas.userOptionalSchema.validate(updatedUser);
        if (result.error) {
            throw new Error(result.error);
        }
        const usersCollections = await users();
        const updatedUserData = result.value;

        // id already exists
        delete updatedUserData["_id"];

        //Updated in the DB
        await usersCollections.updateOne({
            _id: ObjectID.ObjectId(id)
        }, {
            $set: updatedUserData
        });
        return await this.getUserById(id);

    },

    async removeUser(id) {
        if (!id || typeof id !== 'string' || id == "") {
            throw new Error("Must provide valid string id");
        }
        const usersCollection = await users();
        const user = await this.getUserById(id);
        //Delete from db
        const deletionInfo = await usersCollection.deleteOne({
            _id: ObjectID.ObjectId(id)
        });
        if (deletionInfo.deletedCount === 0) {
            throw new Error(`Could not delete user with id of ${id}`);
        }
        return user;
    },

    async refreshAuthToken(user_id, callback) {
        let user = await this.getUserById(user_id);
        let access_token = user.access_token;

        var refresh_token = user.refresh_token;
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + (new Buffer(spotifyConfig.client_id + ':' + spotifyConfig.client_secret).toString('base64'))
            },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            },
            json: true
        };

        request.post(authOptions, async function (error, response, body) {
            if (!error && response.statusCode === 200) {
                access_token = body.access_token;
                user.access_token = body.access_token;
            }
            if (body.refresh_token) {
                user.refresh_token = body.refresh_token;
            }
        });

        if (access_token) {
            await this.updateUser(user_id, user);
        }
        if (callback) {
            callback();
        }
    },

    async loadUserTopArtists(user_id) {

        let user = await this.getUserById(user_id);
        // Flow: Call spotifyData, have that get the data, add to artist db, return artist names
        try {
            let artists = await spotifyData.getUserTopArtists(user._id, user.access_token);
            user.topArtists = artists;
            await this.updateUser(user_id, user);
        } catch (e) {
            console.log(e);
        }
    },

    async loadUserTopSongs(user_id) {
        let user = await this.getUserById(user_id);
        // Flow: Call spotifyData, have that get the data, add to artist db, return artist names

        try {
            let songs = await spotifyData.getUserTopSongs(user._id, user.access_token);
            user.topSongs = songs;
            await this.updateUser(user_id, user);
        } catch (e) {
            console.log(e);
        }
    },

    async loadUserMusicProfile(user_id) {

        let user = await this.getUserById(user_id);


        let artists = user.topArtists;
        let songs = user.topSongs;

        let profile = {
            user_id: user._id,
            topGenres: [],
            averageAudioFeatures: {}
        };

        let topGenreCount = {};

        for (let artist of artists) {
            for (let genre of artist.genres) {
                if (topGenreCount[genre])
                    topGenreCount[genre]++
                else
                    topGenreCount[genre] = 1
            }
        }

        // why can't we have nice things like python <LOL>
        profile.topGenres = Object.entries(topGenreCount).sort((a, b) => b[1] - a[1]);

        profile.topGenres = profile.topGenres.slice(0, Math.min(5, profile.topGenres.length));

        profile.topGenres = profile.topGenres.map((x) => x[0]);

        for (let song of songs) {
            let features = song.audio_features;
            for (let key of Object.keys(features)) {
                if (profile.averageAudioFeatures[key])
                    profile.averageAudioFeatures[key] += features[key]
                else
                    profile.averageAudioFeatures[key] = features[key]
            }
        }

        for (let [key, value] of Object.entries(profile.averageAudioFeatures)) {
            profile.averageAudioFeatures[key] = value / songs.length;
        }

        console.log(profile);

        let musicalProfile = null;
        if (user.musicalProfile)
            musicalProfile = await profileData.updateProfile(user.musicalProfile, profile);
        else
            musicalProfile = await profileData.addProfile(profile);

        user.musicalProfile = musicalProfile._id;

        await this.updateUser(user_id, user);

        return musicalProfile;
    },

    async loadTopSongs() {
        let users = await this.getAllUsers();
        let topSongs = {};
        for (x of users) {
            for (song of await x.topSongs) {
                let name = song.name;
                if (Object.keys(topSongs).includes(name)) {
                    topSongs[name] = topSongs[name] + 1;
                } else {
                    topSongs[name] = 1;
                }
            }
        }
        let topSongsSort = []
        for (song of Object.keys(topSongs)) {
            let temp = [];
            temp.push(song);
            temp.push(topSongs[song]);
            topSongsSort.push(temp);
        }
        topSongsSort = topSongsSort.sort((a, b) => b[1] - a[1]);
        let topTenArray = topSongsSort.slice(0, 10);
        let topTen = [];
        for (song of topTenArray) {
            topTen.push(song[0]);
        }
        topTenFull = [];
        for (song of topTen) {
            const songsCollection = await songs();
            const s = await songsCollection.findOne({
                name: song
            });
            topTenFull.push(s);
        }
        return topTenFull;
    },

    async loadTopArtists() {
        let users = await this.getAllUsers();
        let topArtists = {};
        for (x of users) {
            for (artist of await x.topArtists) {
                let name = artist.name;
                if (Object.keys(topArtists).includes(name)) {
                    topArtists[name] = topArtists[name] + 1;
                } else {
                    topArtists[name] = 1;
                }
            }
        }
        let topArtistsSort = []
        for (artist of Object.keys(topArtists)) {
            let temp = [];
            temp.push(artist);
            temp.push(topArtists[artist]);
            topArtistsSort.push(temp);
        }
        topArtistsSort = topArtistsSort.sort((a, b) => b[1] - a[1]);
        let topTenArray = topArtistsSort.slice(0, 10);
        let topTen = [];
        for (song of topTenArray) {
            topTen.push(song[0]);
        }
        topTenFull = [];
        for (artist of topTen) {
            const artistsCollection = await artists();
            const a = await artistsCollection.findOne({
                name: artist
            });
            topTenFull.push(a);
        }
        return topTenFull;
    },

    async getFollowers(id) {
        let user = await this.getUserById(id);

        const usersCollection = await users(); //Obtain user collection
        const usersList = await usersCollection.find({
            likedProfiles: id
        }).toArray(); //get all users who have liked this user

        return usersList;
    },

    async getFollowing(id) {
        let user = await this.getUserById(id);

        let likedUsers = [];

        if (user.likedProfiles) {
            for (let user_id of user.likedProfiles) {
                try {
                    let profile = await this.getUserById(user_id);
                    likedUsers.push(profile);
                } catch (e) {
                    continue;
                }
            }
        }

        return likedUsers;
    }
};

module.exports = exportedMethods;