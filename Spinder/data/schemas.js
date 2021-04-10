const Joi = require('joi');
const {ObjectId} = require('mongodb');

const objectIdSchema = Joi.string.regex("/^[0-9a-fA-F]{24}$/");

const userSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  location: Joi.object({
    country: Joi.string().min(1).required(),
    city: Joi.string().min(1).required()
  }).required(),
  img : Joi.string().uri().required(),
  topArtists: Joi.array().items(artistSchema).default([]),
  topSongs: Joi.array().items(songSchema).default([]),
  playlists: Joi.array().items(Joi.string.uri()).default([]),
  likedProfiles: Joi.array().items(objectIdSchema),
  musicalProfile: objectIdSchema.default("").required()
});

const profileSchema = Joi.object({

});

const artistSchema = Joi.object({

});

const songSchema = Joi.object({

});
