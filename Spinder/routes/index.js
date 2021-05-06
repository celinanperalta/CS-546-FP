const userRoutes = require('./users');
const profileRoutes = require('./profiles');
const artistRoutes = require('./artists');
const songRoutes = require('./songs');
const spotifyRoutes = require('./spotify');
const data = require('../data');
const userData = data.users;
const bcrypt = require('bcrypt');
const xss = require('xss');
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
      res.redirect('/login');
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

    if(xss(req.body.password) !== xss(req.body.confirmPassword)){
      return res.status(401).render('register', {
        error: 'Password did not match.',
        partial: 'register_validation'
      });
    }

    
    let isExisting = await userData.checkExistence(xss(req.body.username));
    if(isExisting){
      return res.status(401).render('register', {
        error: 'That username is taken.',
        partial: 'register_validation'
      });
    }
    // assuming all is well we hash the password
    let hashedPassword = await bcrypt.hash(xss(req.body.password), saltRounds);
    let user = {
      "firstName" : xss(req.body.firstName),
      "lastName": xss(req.body.lastName),
      "username": xss(req.body.username),
      "location": {"country": xss(req.body.country), "city": xss(req.body.city)},
      "hashedPassword": hashedPassword,
    };
    let insertedUser =  await userData.addUser(user);

    req.session.AuthCookie = true;
    req.session.user = insertedUser._id;
    res.redirect('/users/' + insertedUser._id);

  }),

  app.get('/login', async (req, res) => {
    res.render('login', {title: 'Login'});
  }),

  app.post('/login', async (req, res) => {
    /*get req.body username and password
      const { username, password } = req.body;
      here, you would get the user from the db based on the username, then you would read the hashed pw
      and then compare it to the pw in the req.body
      let match = bcrypt.compare(password, 'HASHED_PW_FROM DB');
      if they match then set req.session.user and then redirect them to the login page
       I will just do that here */
    const {
        username,
        password
    } = req.body;
    let user = await userData.getUserByUsername(username).catch(exception => {
      return undefined;
    });
    if (req.session.AuthCookie) {
      // If authenticated, show them all users
      if(user.access_token != ""){
        await userData.refreshAuthToken(user._id);
      }
      return res.redirect('/users');
    } else {
      //here I',m just manually setting the req.method to post since it's usually coming from a form
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
        req.session.AuthCookie = true;
        req.session.user = user._id;
        if(user.access_token !== ""){
          await userData.refreshAuthToken(user._id);
        }
        res.redirect('/users/' + user._id);
      } else {
        return res.status(401).render('login', {
          title: "Login",
          error: "Incorrect username or password."
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