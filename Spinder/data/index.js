const userData = require('./users');
const profileData = require('./profiles');
const artistData = require('./artists');
const songData = require('./songs');
const spotifyData = require('./spotify');

module.exports = {
  users: userData,
  profiles: profileData,
  artists: artistData,
  songs: songData,
  spotify: spotifyData
};