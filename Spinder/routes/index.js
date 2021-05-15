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

function isLoggedIn(req,res,next) {
  if (xss(req.session.AuthCookie)) {
    next();
  } else {
    res.redirect('/login');
  }
};

function restrictUrlAccess(req, res, next){
  if (xss(req.headers['not-url'])) {
    // custom header exists, then call next() to pass to the next function
    next();
  } else {
    res.redirect('/');  
  }
};

const constructorMethod = (app) => {
  app.use('/users', isLoggedIn, userRoutes);
  app.use('/profiles', restrictUrlAccess, profileRoutes);
  app.use('/artists', restrictUrlAccess, artistRoutes);
  app.use('/songs', restrictUrlAccess, songRoutes);
  app.use('/spotify', isLoggedIn, spotifyRoutes);

  app.use('/stats', isLoggedIn);

  app.get("/", async (req, res) => {
    if(xss(req.session.AuthCookie)) {
      console.log("root");
      res.redirect('/users');
    } else {
      // TODO: put cute ass home page here
      res.render("home", {isHomePage: true});
    }
  });

  app.get("/home", async (req, res) => {
    // const curr_user = await userData.getUserById(req.session.user);
    // const topSongs = await userData.loadTopSongs();
    // const topArtists = await userData.loadTopArtists();
    // const users = await userData.getAllUsers();
    res.render('home', {
      // title: 'Homepage',
      // curr_user: curr_user,
      // isLoggedIn: req.session.AuthCookie,
      // topSongs: topSongs,
      // topArtists: topArtists,
      // userCount: users.length
      // })
      isHomePage: true
    })
  });

  app.get("/stats", async (req, res) => {
    const curr_user = await userData.getUserById(xss(req.session.user));
    const topSongs = await userData.loadTopSongs();
    const topArtists = await userData.loadTopArtists();
    const users = await userData.getAllUsers();
    res.render('stats', {
      title: 'User Statistics',
      curr_user: curr_user,
      isLoggedIn: xss(req.session.AuthCookie),
      topSongs: topSongs,
      topArtists: topArtists,
      userCount: users.length
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
    if (xss(req.session.AuthCookie)) {
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
        res.redirect('/users');
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
    res.redirect('/home');
  });

  app.use('*', (req, res) => {
    // console.log("all other routes");
    // res.status(404).redirect('/');
    res.status(404).render('error', {status:"404", error:"Uh Oh, Page Not Found!", redirect:'home', redirectText:'Home'});
  });
 
};

module.exports = constructorMethod;