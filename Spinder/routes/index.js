const userRoutes = require('./users');
const profileRoutes = require('./profiles');
const artistRoutes = require('./artists');
const songRoutes = require('./songs');

const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/profiles', profileRoutes);
  app.use('/artists', artistRoutes);
  app.use('/songs', songRoutes);

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;