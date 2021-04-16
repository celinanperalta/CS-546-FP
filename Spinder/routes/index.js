const userRoutes = require('./users');
const profileRoutes = require('./profiles');
const artistRoutes = require('./artists');
const songRoutes = require('./songs');
const spotifyRoutes = require('./spotify');

const constructorMethod = (app) => {


  app.use('/users', userRoutes);
  app.use('/profiles', profileRoutes);
  app.use('/artists', artistRoutes);
  app.use('/songs', songRoutes);
  app.use('/spotify', spotifyRoutes);

  app.get("/", async (req, res) => {
    res.render('login', {title: 'Log in to Spinder'})
  });

  app.get("/home", async (req, res) => {
    res.render('home', {title: 'Homepage'})
  });

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;