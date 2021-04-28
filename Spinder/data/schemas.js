const Joi = require('joi');
const {ObjectId} = require('mongodb');

const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const spotifyIdSchema = Joi.string().regex(/^[0-9A-Za-z_-]{22}$/);
const audioFeatureSchema = Joi.object({
  danceability: Joi.number().required(),
  energy: Joi.number().required(),
  key: Joi.number().required(),
  loudness: Joi.number().required(),
  mode: Joi.number().required(),
  speechiness: Joi.number().required(),
  acousticness: Joi.number().required(),
  instrumentalness: Joi.number().required(),
  liveness: Joi.number().required(),
  valence: Joi.number().required(),
  tempo: Joi.number().required(),
});

const profileSchema = Joi.object({
  user_id: objectIdSchema.required(),
  topGenres : Joi.array().items(Joi.string().min(1)).default([]), 
  averageAudioFeatures: audioFeatureSchema.required()
});

const artistSchema = Joi.object({
    _id: Joi.string(),
    user_ids : Joi.array().items(objectIdSchema).default([]).required(),
    spotify_id: spotifyIdSchema.required(),
    spotify_url: Joi.string().uri().required(),
    name: Joi.string().min(1).required(),
    img: Joi.string().uri()
});

const songSchema = Joi.object({
  _id: Joi.string(),
  user_ids : Joi.array().items(objectIdSchema).default([]).required(),
    spotify_id: spotifyIdSchema.required(),
    spotify_url: Joi.string().uri().required(),
    name: Joi.string().min(1).required(),
    album_name: Joi.string().min(1).required(),
    artists: Joi.array().items(Joi.string().min(1)).required(),
    img: Joi.string().uri(),
    audio_features: audioFeatureSchema.required()
});

const userSchema = Joi.object({
  _id: Joi.string(),
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  location: Joi.object({
    country: Joi.string().min(1).required(),
    city: Joi.string().min(1).required()
  }).required(),
  img : Joi.string().default(""),
  topArtists: Joi.array().items(artistSchema).default([]),
  topSongs: Joi.array().items(songSchema).default([]),
  playlists: Joi.array().items(Joi.string().uri()).default([]),
  likedProfiles: Joi.array().items(objectIdSchema).default([]),
  musicalProfile: objectIdSchema,
  access_token: Joi.string().min(1).required(),
  refresh_token: Joi.string().min(1).required()
});

const userOptional = Joi.object({
  _id: Joi.string(),
  firstName: Joi.string().min(1),
  lastName: Joi.string().min(1),
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
  location: Joi.object({
    country: Joi.string().min(1),
    city: Joi.string().min(1)
  }),
  img : Joi.string().default(""),
  topArtists: Joi.array().items(artistSchema).default([]),
  topSongs: Joi.array().items(songSchema).default([]),
  playlists: Joi.array().items(Joi.string().uri()).default([]),
  likedProfiles: Joi.array().items(objectIdSchema).default([]),
  musicalProfile: objectIdSchema,
  access_token: Joi.string().min(1),
  refresh_token: Joi.string().min(1)
});

module.exports = {
  userSchema: userSchema,
  artistSchema: artistSchema,
  songSchema: songSchema,
  profileSchema: profileSchema,
  userOptional: userOptional
}