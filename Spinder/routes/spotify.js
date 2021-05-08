const express = require('express');// Express web server framework
const router = express.Router();
const request = require('request'); // "Request" library
const querystring = require('querystring');
const config = require('../config/spotify_config');
const spotifyConfig = config.spotifyConfig;
const bcrypt = require('bcrypt');

const data = require('../data');
const spotifyData = data.spotify;
const userData = data.users;

var client_id = spotifyConfig.client_id; // Your client id
var client_secret = spotifyConfig.client_secret; // Your secret
var redirect_uri = spotifyConfig.redirect_uri; // Your redirect uri - used after first login call to return access/refresh token
var scope = spotifyConfig.scope;
var stateKey = 'spotify_auth_state'; // Sent in 1st call as state, not required but highly suggested

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
*/
 var generateRandomString = function(length) {
   var text = '';
   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
   for (var i = 0; i < length; i++) {
     text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return text;
 };

// Responsible for first login, response return authorization code
router.get('/login', async function(req, res) {
 
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
        show_dialog: true
        }));
});
 
// 2nd Call submits authorization code from 1st call, to retrieve refresh / access tokens
// Access token expires in 1 hour.
router.get('/callback', async function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter
  
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, async function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          var access_token = body.access_token,
              refresh_token = body.refresh_token;

          // we can also pass the token to the browser to make requests from there
          // for now ignore this, just display the profile
        //   res.redirect('/#' +
        //     querystring.stringify({
        //       access_token: access_token,
        //       refresh_token: refresh_token
        //     }));
            
            let user = await userData.getUserById(req.session.user);
            user.access_token = access_token;
            user.refresh_token = refresh_token;
            let topSongs = await spotifyData.getUserTopSongs(req.session.user, user.access_token);
            let topArtists = await spotifyData.getUserTopArtists(req.session.user, user.access_token);
            let playlists = await spotifyData.getUserPlaylists(req.session.user, user.access_token);
            let image = await spotifyData.getUserImg(user.access_token);
            user.img = image;
            user.topArtists = topArtists;
            user.topSongs = topSongs;
            user.playlists = playlists;
            await userData.updateUser(req.session.user, user);

            // just load it again to be safe
            await userData.loadUserSpotifyData(req.session.user);

            // await userData.updateUser(req.session.user, user);
            res.redirect('/users/' + req.session.user);
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });
 
// 3rd Call submits refresh token from 2nd call to retrieve new access token
router.get('/refresh_token', async function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
            'access_token': access_token
        });
        }
    });
});

module.exports = router;