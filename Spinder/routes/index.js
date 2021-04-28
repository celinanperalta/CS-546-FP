const userRoutes = require('./users');
const profileRoutes = require('./profiles');
const artistRoutes = require('./artists');
const songRoutes = require('./songs');
const spotifyRoutes = require('./spotify');
const data = require('../data');
const userData = data.userData;
const bcrypt = require('bcrypt');
const e = require('express');
const { ObjectId } = require('bson');

const saltRounds = 16;

const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/profiles', profileRoutes);
  app.use('/artists', artistRoutes);
  app.use('/songs', songRoutes);
  app.use('/spotify', spotifyRoutes);

  app.get("/", async (req, res) => {
    if(req.session.AuthCookie){
      res.redirect('/home');
    } else {
      res.render('login', {
        title: 'Log in to Spinder'
      });
    }
  });

  app.get("/home", async (req, res) => {
    res.render('home', {
      title: 'Homepage'
    })
  });

  app.get("/register", async (req, res) => {
    res.render('register', {
      title: 'Register',
      partial: 'register_validation'
    });
  });

  app.post('/register', async (req, res) => {

    if(req.body.password !== req.body.confirm-password){
      res.status(401).render('register', {
        error: 'Password did not match.'
      });
    }
    if(userData.checkExistence(req.body.username) === true){
      res.status(401).render('register', {
        error: 'That username is taken.'
      });
    }
    // assuming all is well we hash the password
    let hashedPassword = bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      if (err) {
        console.error(err)
        return
      }
      return hash;
    });
    let user = {
      "_id" : ObjectId(),
      "firstName" : req.body.firstName,
      "lastName": req.body.lastName,
      "username": req.body.username,
      "location": {"country": req.body.country, "city": req.body.city},
      "hashedPassword": hashedPassword,
    };
    let insertedUser = userData.addUser(user);
    console.log(insertedUser);
    res.redirect('/home', {title: "This worked!"});

  }),

  app.post('/login', async (req, res) => {
    /*get req.body username and password
      const { username, password } = req.body;
      here, you would get the user from the db based on the username, then you would read the hashed pw
      and then compare it to the pw in the req.body
      let match = bcrypt.compare(password, 'HASHED_PW_FROM DB');
      if they match then set req.session.user and then redirect them to the login page
       I will just do that here */

    if (req.session.AuthCookie) {
      // If authenticated, show them all users
      return res.redirect('/users');
    } else {
      //here I',m just manually setting the req.method to post since it's usually coming from a form

      const {
        username,
        password
      } = req.body;

      let user = await userData.getUserByUsername(username);

      if (!user) {
        return res.status(401).render('login', {
          title: "Login",
          error: `User ${username} not found.`
        });
      }

      let match = false;

      try {
        match = await bcrypt.compare(password, user.hashedPassword);
      } catch (e) {
        console.log("Error: " + e);
      }
      if (match) {
        req.session.AuthCookie = "true";
        req.session.user = user._id;
        res.redirect('/users/' + user._id);
      } else {
        return res.status(401).render('pages/login', {
          title: "Login",
          error: true
        });
      }
    }
  });

  app.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;