const Joi = require('joi');
const {ObjectId} = require('mongodb');

const objectIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const spotifyIdSchema = Joi.string().regex(/^[0-9A-Za-z_-]{22}$/);
const audioFeatureSchema = Joi.object({
  danceability: Joi.number().default(0),
  energy: Joi.number().default(0),
  key: Joi.number().default(0),
  loudness: Joi.number().default(0),
  mode: Joi.number().default(0),
  speechiness: Joi.number().default(0),
  acousticness: Joi.number().default(0),
  instrumentalness: Joi.number().default(0),
  liveness: Joi.number().default(0),
  valence: Joi.number().default(0),
  tempo: Joi.number().default(0)
});

const profileSchema = Joi.object({
  user_id: objectIdSchema.required(),
  topGenres : Joi.array().items(Joi.string().min(1)).default([]), 
  averageAudioFeatures: audioFeatureSchema.required()
});

const artistSchema = Joi.object({
    _id: Joi.string(),
    user_ids : Joi.array().items(objectIdSchema).default([]),
    spotify_id: spotifyIdSchema.required(),
    spotify_url: Joi.string().uri().required(),
    name: Joi.string().min(1).required(),
    img: Joi.string().default("../public/images/default_user.jpg"),
    genres: Joi.array().items(Joi.string()).default([])
});

const songSchema = Joi.object({
    _id: Joi.string(),
    user_ids : Joi.array().items(objectIdSchema).default([]),
    spotify_id: spotifyIdSchema.required(),
    spotify_url: Joi.string().uri().required(),
    name: Joi.string().min(1).required(),
    album_name: Joi.string().min(1).required(),
    artists: Joi.array().items(Joi.string().min(1)).required(),
    img: Joi.string().default("../public/images/default_user.jpg"),
    audio_features: audioFeatureSchema.required()
});

const playlistSchema = Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().allow('').optional(),
    spotify_id: spotifyIdSchema.required(),
    spotify_url: Joi.string().uri().required(),
    tracks: Joi.number().required(),
    user_id: Joi.string(),
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
  img : Joi.string().default("../public/images/default_user.jpg"),
  topArtists: Joi.array().items(artistSchema).default([]),
  topSongs: Joi.array().items(songSchema).default([]),
  playlists: Joi.array().items(Joi.string().uri()).default([]),
  likedProfiles: Joi.array().items(objectIdSchema).default([]),
  musicalProfile: objectIdSchema,
  access_token: Joi.string().min(1).required(),
  refresh_token: Joi.string().min(1).required(),
  hashedPassword: Joi.string().min(4).required(),
  bio: Joi.string().default("")
});

// When a user first registers, all Spotify-related fields should be default values
const newUserSchema = Joi.object({
  _id: Joi.string(),
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  location: Joi.object({
    country: Joi.string().min(1).required(),
    city: Joi.string().min(1).required()
  }).required(),
  img : Joi.string().default("../public/images/default_user.jpg"),
  topArtists: Joi.array().items(artistSchema).default([]),
  topSongs: Joi.array().items(songSchema).default([]),
  playlists: Joi.array().items(playlistSchema).default([]),
  likedProfiles: Joi.array().items(objectIdSchema).default([]),
  musicalProfile: objectIdSchema,
  access_token: Joi.string().min(1),
  refresh_token: Joi.string().min(1),
  hashedPassword: Joi.string().min(4).required(),
});

const userOptionalSchema = Joi.object({
  _id: Joi.string(),
  firstName: Joi.string().min(1),
  lastName: Joi.string().min(1),
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
  location: Joi.object({
    country: Joi.string().min(1),
    city: Joi.string().min(1)
  }),
  img : Joi.string(),
  topArtists: Joi.array().items(artistSchema),
  topSongs: Joi.array().items(songSchema),
  playlists: Joi.array().items(playlistSchema),
  likedProfiles: Joi.array().items(objectIdSchema),
  musicalProfile: objectIdSchema,
  access_token: Joi.string().min(1),
  refresh_token: Joi.string().min(1),
  hashedPassword: Joi.string().min(4),
  bio: Joi.string().allow("")
});

module.exports = {
  newUserSchema: newUserSchema,
  userSchema: userSchema,
  userOptionalSchema: userOptionalSchema,
  artistSchema: artistSchema,
  songSchema: songSchema,
  profileSchema: profileSchema,
  userOptional: userOptionalSchema
}